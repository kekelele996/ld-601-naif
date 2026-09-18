export const FacilityClosureStatus = ["ACTIVE", "RELEASED"] as const;
export type FacilityClosureStatus = (typeof FacilityClosureStatus)[number];
