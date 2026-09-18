export const FacilityStatus = ["AVAILABLE","BLOCKED","MAINTENANCE","UNKNOWN"] as const;
export type FacilityStatus = (typeof FacilityStatus)[number];
