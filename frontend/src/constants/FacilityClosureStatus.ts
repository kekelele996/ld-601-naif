export const FacilityClosureStatus = ["ACTIVE", "RELEASED"] as const;
export type FacilityClosureStatus = (typeof FacilityClosureStatus)[number];
export const FacilityClosureStatusText: Record<FacilityClosureStatus, string> = {
  ACTIVE: "封控中",
  RELEASED: "已解除"
};
