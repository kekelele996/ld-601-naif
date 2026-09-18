export const MobilityType = ["BLIND","LOW_VISION","WHEELCHAIR","ELDERLY","TEMPORARY_INJURY"] as const;
export type MobilityType = (typeof MobilityType)[number];
export const MobilityTypeText: Record<MobilityType, string> = Object.fromEntries(MobilityType.map((value) => [value, value.replace(/_/g, " ")])) as Record<MobilityType, string>;
