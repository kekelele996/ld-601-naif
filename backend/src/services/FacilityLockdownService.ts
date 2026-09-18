import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { assistanceRequestRepository } from "../repositories/AssistanceRequestRepository";
import { barrierReportRepository } from "../repositories/BarrierReportRepository";
import { facilityLockdownRepository, withFacilityLock } from "../repositories/FacilityLockdownRepository";
import { createFacilityLockdownDto } from "../constructors/FacilityLockdownDtoFactory";
import { BusinessError } from "../utils/businessError";
import { FacilityStatus } from "../constants/FacilityStatus";
import { RouteDispatchStatus } from "../constants/RouteDispatchStatus";
import { BarrierVerifyStatus } from "../constants/BarrierVerifyStatus";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { FacilityLockdown, RouteSnapshot } from "../models/FacilityLockdown";
import type { FacilityLockdownPayload } from "../types/FacilityLockdownPayload";

const audit = (action: string, extra: Record<string, unknown> = {}) =>
  console.info("audit", action, JSON.stringify(extra));

const now = () => new Date().toISOString();

/** Barrier reports that still count as "to be verified" obstacles at release. */
const UNRESOLVED_VERIFY_STATUSES = [BarrierVerifyStatus[0], "PENDING", "BLOCKED", "MAINTENANCE"];

export const facilityLockdownService = {
  list() {
    return facilityLockdownRepository.findAll();
  },

  /**
   * Inspector locks a facility because of an obstacle.
   * Atomic: validation failure leaves facility, routes and assistance untouched.
   * Exactly-once: same idempotency key (duplicate submit / refresh replay) or a
   * concurrent caller on the same facility only succeeds the first time.
   */
  async lockdown(payload: FacilityLockdownPayload): Promise<FacilityLockdown> {
    const facilityId = Number(payload.facility_id);
    const impactScope = String(payload.impact_scope ?? "").trim();
    const expectedReleaseAt = String(payload.expected_release_at ?? "").trim();
    const idempotencyKey = String(payload.idempotency_key ?? "").trim();
    const inspectorId = Number(payload.inspector_id ?? 1);

    // ---- Validation (no mutation yet) ----
    if (!Number.isInteger(facilityId) || facilityId <= 0) {
      throw new BusinessError("VALIDATION_FAILED", 400);
    }
    if (!impactScope) {
      throw new BusinessError("VALIDATION_FAILED", 400, "impact_scope is required");
    }
    if (!expectedReleaseAt || Number.isNaN(Date.parse(expectedReleaseAt))) {
      throw new BusinessError("VALIDATION_FAILED", 400, "expected_release_at must be a valid time");
    }
    if (!idempotencyKey) {
      throw new BusinessError("VALIDATION_FAILED", 400, "idempotency_key is required");
    }

    const facility = accessibleFacilityRepository.findById(facilityId);
    if (!facility) {
      throw new BusinessError("FACILITY_NOT_FOUND", 404);
    }

    return withFacilityLock(facilityId, async () => {
      // Refresh replay / duplicate submit of the exact same request -> no second effect.
      if (facilityLockdownRepository.hasIdempotencyKey(idempotencyKey)) {
        audit(LOG_TEMPLATES.FacilityLockdown[4], { facilityId, idempotencyKey });
        throw new BusinessError("LOCKDOWN_REPLAYED", 409);
      }
      // One facility can only have a single active lockdown.
      if (facilityLockdownRepository.findActiveByFacilityId(facilityId)) {
        throw new BusinessError("FACILITY_ALREADY_LOCKED", 409);
      }

      // ---- Snapshot then mutate (rollback restores these on any failure) ----
      const facilitySnapshot = { ...facility };
      let createdId: number | null = null;
      const affectedRoutes = routePlanRepository.findByFacilityId(facilityId);
      const routeSnapshots: RouteSnapshot[] = affectedRoutes.map((route) => ({
        route_id: Number(route.id),
        risk_level: String(route.risk_level),
        dispatch_status: String(route.dispatch_status ?? RouteDispatchStatus[0])
      }));
      const affectedRouteIds = routeSnapshots.map((snapshot) => snapshot.route_id);
      const dispatchedRequests = assistanceRequestRepository.findDispatchedByRouteIds(affectedRouteIds);
      const assistanceSnapshots = dispatchedRequests.map((request) => ({ ...request }));

      try {
        // Facility -> blocked.
        facility.status = FacilityStatus[1]; // BLOCKED
        facility.last_checked_at = now();

        // Affected routes -> suspended immediately, risk surfaced as high.
        affectedRoutes.forEach((route) => {
          route.risk_level = "HIGH";
          route.dispatch_status = RouteDispatchStatus[1]; // SUSPENDED
          (route as { locked_by_lockdown_id?: number | null }).locked_by_lockdown_id = null;
        });

        // Already dispatched assistance requests -> returned for re-dispatch.
        dispatchedRequests.forEach((request) => {
          request.status = "RETURNED_FOR_DISPATCH";
          request.helper_id = 0 as unknown as number;
        });

        const record = createFacilityLockdownDto({
          id: facilityLockdownRepository.nextId(),
          facility_id: facilityId,
          inspector_id: inspectorId,
          impact_scope: impactScope,
          expected_release_at: expectedReleaseAt,
          status: "ACTIVE",
          idempotency_key: idempotencyKey,
          release_idempotency_key: null,
          route_snapshots: routeSnapshots,
          affected_route_ids: affectedRouteIds,
          returned_assistance_ids: dispatchedRequests.map((request) => Number(request.id)),
          unresolved_barrier_on_release: false,
          created_at: now(),
          released_at: null
        });
        const created = facilityLockdownRepository.insert(record);
        createdId = created.id;

        affectedRoutes.forEach((route) => {
          (route as { locked_by_lockdown_id?: number | null }).locked_by_lockdown_id = created.id;
        });

        audit(LOG_TEMPLATES.AccessibleFacility[4], { facilityId, lockdownId: created.id });
        affectedRoutes.forEach((route) => audit(LOG_TEMPLATES.RoutePlan[4], { routeId: route.id }));
        dispatchedRequests.forEach((request) =>
          audit(LOG_TEMPLATES.AssistanceRequest[4], { assistanceId: request.id })
        );

        return created;
      } catch (error) {
        // Any failure during the write fan-out restores facility, routes and requests.
        Object.assign(facility, facilitySnapshot);
        affectedRoutes.forEach((route) => {
          const snapshot = routeSnapshots.find((entry) => entry.route_id === Number(route.id));
          if (snapshot) {
            route.risk_level = snapshot.risk_level;
            route.dispatch_status = snapshot.dispatch_status;
            (route as { locked_by_lockdown_id?: number | null }).locked_by_lockdown_id = null;
          }
        });
        dispatchedRequests.forEach((request) => {
          const snapshot = assistanceSnapshots.find((entry) => Number(entry.id) === Number(request.id));
          if (snapshot) Object.assign(request, snapshot);
        });
        if (createdId !== null) facilityLockdownRepository.remove(createdId);
        throw error;
      }
    });
  },

  /**
   * Release a lockdown. When an obstacle still awaits verification the facility
   * may recover, but its routes stay HIGH risk and dispatch is forbidden.
   * Concurrent release / refresh replay only takes effect once.
   */
  async release(payload: FacilityLockdownPayload): Promise<FacilityLockdown> {
    const facilityId = Number(payload.facility_id);
    const idempotencyKey = String(payload.release_idempotency_key ?? payload.idempotency_key ?? "").trim();

    if (!Number.isInteger(facilityId) || facilityId <= 0) {
      throw new BusinessError("VALIDATION_FAILED", 400);
    }
    if (!idempotencyKey) {
      throw new BusinessError("VALIDATION_FAILED", 400, "release idempotency_key is required");
    }

    const facility = accessibleFacilityRepository.findById(facilityId);
    if (!facility) {
      throw new BusinessError("FACILITY_NOT_FOUND", 404);
    }

    return withFacilityLock(facilityId, async () => {
      if (facilityLockdownRepository.hasIdempotencyKey(idempotencyKey)) {
        audit(LOG_TEMPLATES.FacilityLockdown[4], { facilityId, idempotencyKey });
        throw new BusinessError("LOCKDOWN_REPLAYED", 409);
      }

      const active = facilityLockdownRepository.findActiveByFacilityId(facilityId);
      if (!active) {
        throw new BusinessError("LOCKDOWN_NOT_FOUND", 404);
      }
      const lockdownSnapshot = {
        status: active.status,
        release_idempotency_key: active.release_idempotency_key,
        unresolved_barrier_on_release: active.unresolved_barrier_on_release,
        released_at: active.released_at
      };

      const facilitySnapshot = { ...facility };
      const routes = active.affected_route_ids
        .map((routeId) => routePlanRepository.findById(routeId))
        .filter((route): route is NonNullable<typeof route> => route !== null);
      const routeSnapshots = routes.map((route) => ({
        route_id: Number(route.id),
        risk_level: String(route.risk_level),
        dispatch_status: String(route.dispatch_status ?? RouteDispatchStatus[0])
      }));

      // Are there still obstacles to verify for this facility?
      const unresolvedReports = barrierReportRepository
        .findByFacilityId(facilityId)
        .filter((report) => UNRESOLVED_VERIFY_STATUSES.includes(String(report.verify_status)));
      const hasUnresolvedBarrier = unresolvedReports.length > 0;

      try {
        // Facility always recovers on release.
        facility.status = FacilityStatus[0]; // AVAILABLE
        facility.last_checked_at = now();

        routes.forEach((route) => {
          const snapshot = active.route_snapshots.find((entry) => entry.route_id === Number(route.id));
          if (hasUnresolvedBarrier) {
            // Obstacle pending verification: route stays HIGH risk and dispatch forbidden.
            route.risk_level = "HIGH";
            route.dispatch_status = RouteDispatchStatus[2]; // RISK_HOLD
          } else {
            // All clear: restore pre-lockdown risk and make route dispatchable again.
            route.risk_level = snapshot?.risk_level ?? "LOW";
            route.dispatch_status = RouteDispatchStatus[0]; // DISPATCHABLE
            audit(LOG_TEMPLATES.RoutePlan[6], { routeId: route.id });
          }
          (route as { locked_by_lockdown_id?: number | null }).locked_by_lockdown_id = null;
        });

        if (hasUnresolvedBarrier) {
          routes.forEach((route) => audit(LOG_TEMPLATES.RoutePlan[5], { routeId: route.id }));
        }

        const updated = facilityLockdownRepository.update(active.id, {
          status: "RELEASED",
          release_idempotency_key: idempotencyKey,
          unresolved_barrier_on_release: hasUnresolvedBarrier,
          released_at: now()
        });
        if (!updated) throw new BusinessError("LOCKDOWN_NOT_FOUND", 404);

        audit(LOG_TEMPLATES.AccessibleFacility[5], { facilityId, lockdownId: active.id, hasUnresolvedBarrier });
        return updated;
      } catch (error) {
        Object.assign(facility, facilitySnapshot);
        routes.forEach((route) => {
          const snapshot = routeSnapshots.find((entry) => entry.route_id === Number(route.id));
          if (snapshot) {
            route.risk_level = snapshot.risk_level;
            route.dispatch_status = snapshot.dispatch_status;
          }
          (route as { locked_by_lockdown_id?: number | null }).locked_by_lockdown_id = active.id;
        });
        facilityLockdownRepository.update(active.id, lockdownSnapshot);
        throw error;
      }
    });
  },

  /** Read back the current facility, affected routes and assistance requests. */
  status(facilityId: number) {
    const id = Number(facilityId);
    const facility = accessibleFacilityRepository.findById(id);
    if (!facility) {
      throw new BusinessError("FACILITY_NOT_FOUND", 404);
    }
    const active = facilityLockdownRepository.findActiveByFacilityId(id);
    const latest = facilityLockdownRepository
      .findAll()
      .filter((row) => Number(row.facility_id) === id)
      .sort((a, b) => Number(b.id) - Number(a.id))[0] ?? null;
    const routes = routePlanRepository.findByFacilityId(id);
    const assistance = assistanceRequestRepository
      .findAll()
      .filter((request) => routes.some((route) => Number(route.id) === Number(request.route_plan_id)));
    const reports = barrierReportRepository.findByFacilityId(id);
    return { facility, lockdown: active ?? latest, routes, assistance, barrierReports: reports };
  }
};
