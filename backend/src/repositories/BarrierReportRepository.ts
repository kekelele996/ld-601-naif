import { memoryStore, deepClone } from "./memoryStore";
import type { BarrierReport } from "../models/BarrierReport";

// 解除封控时判定“仍有待核实障碍”的审核状态：审核员尚未给出结论
const PENDING_VERIFY_STATUSES = new Set(["PENDING"]);

export const barrierReportRepository = {
  findAll: (): BarrierReport[] => deepClone(memoryStore.barrierReport),
  findByFacilityId: (facilityId: number): BarrierReport[] => deepClone(memoryStore.barrierReport.filter((row) => row.facility_id === facilityId)),
  hasPendingByFacilityId: (facilityId: number): boolean => memoryStore.barrierReport.some((row) => row.facility_id === facilityId && PENDING_VERIFY_STATUSES.has(row.verify_status)),
  save: (row: unknown): unknown => row
};
