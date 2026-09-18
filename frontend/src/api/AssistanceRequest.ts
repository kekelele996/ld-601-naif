import { mockData } from "../mocks/seedData";
import type { AssistanceRequest } from "../types/AssistanceRequest";

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
