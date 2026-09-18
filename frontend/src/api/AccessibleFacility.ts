import { mockData } from "../mocks/seedData";
import type { AccessibleFacility } from "../types/AccessibleFacility";

const endpoint = "/api/accessible-facility";

export async function listAccessibleFacility(): Promise<AccessibleFacility[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.accessibleFacility as unknown as AccessibleFacility[])];
}

export async function saveAccessibleFacility(payload: AccessibleFacility) {
  console.info("save AccessibleFacility", payload);
  return payload;
}
