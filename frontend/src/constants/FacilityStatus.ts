export const FacilityStatus = ["AVAILABLE","BLOCKED","MAINTENANCE","UNKNOWN"] as const;
export type FacilityStatus = (typeof FacilityStatus)[number];
export const FacilityStatusText: Record<FacilityStatus, string> = {
  AVAILABLE: "可用",
  BLOCKED: "封控停用",
  MAINTENANCE: "维护中",
  UNKNOWN: "未知"
};
