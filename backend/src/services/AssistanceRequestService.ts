import { assistanceRequestRepository } from "../repositories/AssistanceRequestRepository";
import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { notFoundError, conflictError, validationError } from "../utils/serviceError";
import { runInTransaction } from "../utils/transaction";
import { auditLogService } from "./AuditLogService";
import type { AssistanceRequest } from "../models/AssistanceRequest";

export const assistanceRequestService = {
  list: (): AssistanceRequest[] => assistanceRequestRepository.findAll(),
  create: (row: unknown): unknown => assistanceRequestRepository.save(row),

  // 重新派单：封控期间路线停用/解除后保持高风险的路线都禁止派单
  dispatch: async (requestId: number, helperId: number, operatorId: number) => {
    if (!Number.isInteger(helperId) || helperId <= 0) {
      throw validationError("helper_id 必须为正整数");
    }
    return runInTransaction(() => {
      const request = assistanceRequestRepository.findById(requestId);
      if (!request) throw notFoundError(ERROR_CODES.ASSISTANCE_REQUEST_NOT_FOUND);
      if (request.status !== "REQUESTED" || !request.redispatch_required) {
        throw conflictError(ERROR_CODES.ASSISTANCE_REQUEST_NOT_REQUESTED);
      }
      const route = routePlanRepository.findById(request.route_plan_id);
      if (!route) throw notFoundError(ERROR_CODES.ROUTE_NOT_FOUND);
      if (!route.active || !route.dispatch_allowed) {
        throw conflictError(ERROR_CODES.ROUTE_DISPATCH_FORBIDDEN);
      }
      assistanceRequestRepository.dispatch(requestId, helperId, new Date().toISOString());
      const updated = assistanceRequestRepository.findById(requestId) as AssistanceRequest;
      auditLogService.record(operatorId, LOG_TEMPLATES.AssistanceRequest[4], "AssistanceRequest", requestId);
      return { status: 200, body: updated };
    });
  }
};
