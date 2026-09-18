import { mockData } from "../mocks/seedData";
import type { RoutePlan } from "../types/RoutePlan";

const endpoint = "/api/route-plan";

export async function listRoutePlan(): Promise<RoutePlan[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.routePlan as unknown as RoutePlan[])];
}

export async function saveRoutePlan(payload: RoutePlan) {
  console.info("save RoutePlan", payload);
  return payload;
}
