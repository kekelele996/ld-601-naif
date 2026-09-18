import { facilityClosureRepository } from "../repositories/FacilityClosureRepository";
import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { assistanceRequestRepository } from "../repositories/AssistanceRequestRepository";
import { barrierReportRepository } from "../repositories/BarrierReportRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { validationError, notFoundError, conflictError } from "../utils/serviceError";
import { runInTransaction } from "../utils/transaction";
import { withKeyLock } from "../utils/keyedMutex";
import { auditLogService } from "./AuditLogService";
import type { FacilityClosure, PreviousRouteState } from "../models/FacilityClosure";
import type { CreateFacilityClosurePayload } from "../types/FacilityClosurePayload";

export interface ClosureActionResult { status: number; body: FacilityClosure }

const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

const validateClosurePayload = (payload: Partial<CreateFacilityClosurePayload>) => {
  const facilityId = Number(payload.facility_id);
  if (!Number.isInteger(facilityId) || facilityId <= 0) {
    throw validationError("facility_id 必须为正整数");
  }
  if (!isNonEmptyString(payload.impact_scope)) {
    throw validationError("影响范围不能为空");
  }
  if (!isNonEmptyString(payload.estimated_released_at)) {
    throw validationError("预计解除时间不能为空");
  }
  const releaseAt = Date.parse(payload.estimated_released_at);
  if (Number.isNaN(releaseAt) || releaseAt <= Date.now()) {
    throw validationError("预计解除时间必须是晚于当前时间的合法时间");
  }
  return { facilityId, impactScope: payload.impact_scope.trim(), estimatedReleasedAt: payload.estimated_released_at };
};

export const facilityClosureService = {
  list: () => facilityClosureRepository.findAll(),
  get: (id: number) => {
    const closure = facilityClosureRepository.findById(id);
    if (!closure) throw notFoundError(ERROR_CODES.CLOSURE_NOT_FOUND);
    return closure;
  },
  getActiveByFacility: (facilityId: number) => facilityClosureRepository.findActiveByFacilityId(facilityId),

  // 巡检员因障碍封控设施
  close: async (rawPayload: Partial<CreateFacilityClosurePayload>, inspectorId: number): Promise<ClosureActionResult> => {
    const { facilityId, impactScope, estimatedReleasedAt } = validateClosurePayload(rawPayload);

    // 重复提交（含并发提交）：同一设施只允许一条有效封控，设施级互斥串行化
    return withKeyLock(`closure:facility:${facilityId}`, () =>
      runInTransaction(() => {
        const facility = accessibleFacilityRepository.findById(facilityId);
        if (!facility) throw notFoundError(ERROR_CODES.FACILITY_NOT_FOUND);

        const existing = facilityClosureRepository.findActiveByFacilityId(facilityId);
        if (existing) throw conflictError(ERROR_CODES.CLOSURE_ALREADY_ACTIVE);

        const now = new Date().toISOString();
        const affectedRoutes = routePlanRepository.findByFacilityId(facilityId);
        const affectedRouteIds = affectedRoutes.map((route) => route.id);

        // 受影响路线立即停用；先保存封控前快照，解除时据此恢复
        const previousRouteStates: PreviousRouteState[] = affectedRoutes.map((route) => ({
          route_plan_id: route.id,
          active: route.active,
          dispatch_allowed: route.dispatch_allowed,
          risk_level: route.risk_level
        }));
        routePlanRepository.deactivateForClosure(affectedRouteIds);

        // 已发出的协助请求退回待重派
        const returnedRequestIds = assistanceRequestRepository.returnToRedispatch(affectedRouteIds);

        // 设施进入封控态（复用 FacilityStatus.BLOCKED），巡检时间同步
        accessibleFacilityRepository.updateStatus(facilityId, "BLOCKED");
        accessibleFacilityRepository.touchCheckedAt(facilityId, now);

        const closure = {
          id: facilityClosureRepository.nextId(),
          facility_id: facilityId,
          inspector_id: inspectorId,
          impact_scope: impactScope,
          estimated_released_at: estimatedReleasedAt,
          status: "ACTIVE" as const,
          created_at: now,
          released_at: null,
          released_by: null,
          affected_route_ids: affectedRouteIds,
          returned_request_ids: returnedRequestIds,
          pending_barrier_on_release: false,
          previous_facility_status: facility.status,
          previous_route_states: previousRouteStates
        };
        const created = facilityClosureRepository.insert(closure);

        auditLogService.record(inspectorId, LOG_TEMPLATES.FacilityClosure[0], "FacilityClosure", created.id);

        return { status: 201, body: created };
      })
    );
  },

  // 解除封控：并发解除 / 刷新重放只生效一次
  release: async (closureId: number, operatorId: number): Promise<ClosureActionResult> => {
    if (!Number.isInteger(closureId) || closureId <= 0) {
      throw validationError("封控记录 id 必须为正整数");
    }

    return withKeyLock(`closure:release:${closureId}`, () =>
      runInTransaction(() => {
        const live = facilityClosureRepository.claimActiveById(closureId);
        if (live) {
          // 第一个拿到 ACTIVE 实体的调用方执行解除，其余并发调用走重放分支
          const now = new Date().toISOString();

          // 解除时仍有待核实障碍：设施可恢复，但路线保持高风险并禁止派单
          const pendingBarrier = barrierReportRepository.hasPendingByFacilityId(live.facility_id);
          routePlanRepository.restoreAfterRelease(live.previous_route_states, pendingBarrier);

          accessibleFacilityRepository.updateStatus(live.facility_id, live.previous_facility_status);
          accessibleFacilityRepository.touchCheckedAt(live.facility_id, now);

          facilityClosureRepository.markReleased(closureId, now, operatorId, pendingBarrier);
          auditLogService.record(operatorId, LOG_TEMPLATES.FacilityClosure[1], "FacilityClosure", closureId);
        }

        const closure = facilityClosureRepository.findById(closureId);
        if (!closure) throw notFoundError(ERROR_CODES.CLOSURE_NOT_FOUND);
        if (closure.status !== "RELEASED") {
          // 理论不可达：标记失败时必须保持原样抛出
          throw conflictError(ERROR_CODES.CLOSURE_NOT_ACTIVE);
        }

        return { status: 200, body: closure };
      })
    );
  }
};
