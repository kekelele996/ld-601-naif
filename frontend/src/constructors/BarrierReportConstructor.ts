import type { BarrierReport } from "../types/BarrierReport";

export const createDefaultBarrierReport = (overrides: Partial<BarrierReport> = {}): BarrierReport => ({
  id: 1 as never,
  reporter_id: 1 as never,
  facility_id: 1 as never,
  barrier_type: "LOW_VISION" as never,
  description: "description 1" as never,
  photo_url: "/mock/photo_url-1.png" as never,
  verify_status: "BLOCKED" as never,
  priority: "priority 1" as never,
  ...overrides
});

export const createBarrierReportForm = createDefaultBarrierReport;
export const createBarrierReportResponse = createDefaultBarrierReport;
