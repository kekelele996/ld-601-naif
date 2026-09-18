import { memoryStore, deepClone, nextId } from "./memoryStore";
import type { AssistanceRequest } from "../models/AssistanceRequest";

// 封控时需要“退回待重派”的请求：已派单但尚未到场（REQUESTED 已抢到单 / ACCEPTED 已接单）
const RETURNABLE_STATUSES = new Set(["REQUESTED", "ACCEPTED"]);

export const assistanceRequestRepository = {
  findAll: (): AssistanceRequest[] => deepClone(memoryStore.assistanceRequest),
  findById: (id: number): AssistanceRequest | undefined => {
    const row = memoryStore.assistanceRequest.find((item) => item.id === id);
    return row ? deepClone(row) : undefined;
  },
  findReturnableByRouteIds: (routeIds: number[]): AssistanceRequest[] => deepClone(memoryStore.assistanceRequest.filter((row) => routeIds.includes(row.route_plan_id) && RETURNABLE_STATUSES.has(row.status))),
  // 已发出的协助请求退回待重派：状态回到 REQUESTED，清空志愿者并打上待重派标记
  returnToRedispatch: (routeIds: number[]): number[] => {
    const affected: number[] = [];
    memoryStore.assistanceRequest.forEach((row) => {
      if (routeIds.includes(row.route_plan_id) && RETURNABLE_STATUSES.has(row.status)) {
        row.status = "REQUESTED";
        row.helper_id = 0;
        row.redispatch_required = true;
        affected.push(row.id);
      }
    });
    return affected;
  },
  // 重新派单：待重派请求再次被志愿者接单
  dispatch: (id: number, helperId: number, requestTime: string): void => {
    const row = memoryStore.assistanceRequest.find((item) => item.id === id);
    if (row) {
      row.status = "ACCEPTED";
      row.helper_id = helperId;
      row.redispatch_required = false;
      row.request_time = requestTime;
    }
  },
  save: (row: unknown): unknown => {
    const payload = row as Partial<AssistanceRequest>;
    const created: AssistanceRequest = {
      id: payload.id ?? nextId(memoryStore.assistanceRequest),
      user_id: payload.user_id ?? 0,
      route_plan_id: payload.route_plan_id ?? 0,
      helper_id: payload.helper_id ?? 0,
      request_time: payload.request_time ?? new Date().toISOString(),
      status: payload.status ?? "REQUESTED",
      meet_point: payload.meet_point ?? "",
      contact_note: payload.contact_note ?? "",
      redispatch_required: payload.redispatch_required ?? false
    };
    memoryStore.assistanceRequest.push(created);
    return deepClone(created);
  }
};
