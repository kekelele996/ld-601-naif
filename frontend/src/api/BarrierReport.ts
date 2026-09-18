import { mockData } from "../mocks/seedData";
import type { BarrierReport } from "../types/BarrierReport";

const endpoint = "/api/barrier-report";

export async function listBarrierReport(): Promise<BarrierReport[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.barrierReport as unknown as BarrierReport[])];
}

export async function saveBarrierReport(payload: BarrierReport) {
  console.info("save BarrierReport", payload);
  return payload;
}
