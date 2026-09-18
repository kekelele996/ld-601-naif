export const AssistanceStatus = ["REQUESTED","ACCEPTED","ARRIVED","COMPLETED","CANCELLED"] as const;
export type AssistanceStatus = (typeof AssistanceStatus)[number];
export const AssistanceStatusText: Record<AssistanceStatus, string> = {
  REQUESTED: "待重派",
  ACCEPTED: "已接单",
  ARRIVED: "已到场",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
};
