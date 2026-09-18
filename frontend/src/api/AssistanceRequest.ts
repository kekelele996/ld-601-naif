import { mockData } from "../mocks/seedData";
import type { AssistanceRequest } from "../types/AssistanceRequest";
import { postJson } from "./http";

const endpoint = "/api/assistance-request";

export async function listAssistanceRequest(): Promise<AssistanceRequest[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.assistanceRequest as unknown as AssistanceRequest[])];
}

export async function saveAssistanceRequest(payload: AssistanceRequest) {
  console.info("save AssistanceRequest", payload);
  return payload;
}

// 重新派单：封控退回的请求在路线恢复可用后由志愿者重新接单
export async function dispatchAssistanceRequest(id: number, helperId: number, idempotencyKey: string) {
  return postJson<AssistanceRequest>(`${endpoint}/${id}/dispatch`, { helper_id: helperId }, idempotencyKey);
}
