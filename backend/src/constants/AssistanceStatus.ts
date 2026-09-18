export const AssistanceStatus = ["REQUESTED","ACCEPTED","ARRIVED","COMPLETED","CANCELLED"] as const;
export type AssistanceStatus = (typeof AssistanceStatus)[number];
