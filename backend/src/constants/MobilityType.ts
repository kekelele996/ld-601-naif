export const MobilityType = ["BLIND","LOW_VISION","WHEELCHAIR","ELDERLY","TEMPORARY_INJURY"] as const;
export type MobilityType = (typeof MobilityType)[number];
