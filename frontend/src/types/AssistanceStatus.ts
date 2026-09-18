export const AssistanceStatus = ["REQUESTED","ACCEPTED","ARRIVED","COMPLETED","CANCELLED"] as const;
export type AssistanceStatus = (typeof AssistanceStatus)[number];
export const AssistanceStatusText: Record<AssistanceStatus, string> = Object.fromEntries(AssistanceStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<AssistanceStatus, string>;
