import { assistanceRequestRepository } from "../repositories/AssistanceRequestRepository";
import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { BusinessError } from "../utils/businessError";
import { RouteDispatchStatus } from "../constants/RouteDispatchStatus";
import { LOG_TEMPLATES } from "../constants/logTemplates";

// A lockdown that suspends routes or releases them into a risk hold forbids dispatch.
const FORBIDDEN_DISPATCH_STATUSES: string[] = [RouteDispatchStatus[1], RouteDispatchStatus[2]];

export const assistanceRequestService = {
  list: () => assistanceRequestRepository.findAll(),

  /** Create a request only when the backing route is still dispatchable. */
  create: (row: { route_plan_id?: number | string; [key: string]: unknown }) => {
    const routePlanId = Number(row.route_plan_id);
    if (Number.isInteger(routePlanId) && routePlanId > 0) {
      const route = routePlanRepository.findById(routePlanId);
      const dispatchStatus = String(route?.dispatch_status ?? RouteDispatchStatus[0]);
      if (FORBIDDEN_DISPATCH_STATUSES.includes(dispatchStatus)) {
        console.info("audit", LOG_TEMPLATES.AssistanceRequest[4], { routePlanId, dispatchStatus, denied: true });
        throw new BusinessError("ROUTE_DISPATCH_FORBIDDEN", 409);
      }
    }
    return assistanceRequestRepository.save(row);
  }
};
