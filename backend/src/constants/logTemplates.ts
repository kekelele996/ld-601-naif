export const LOG_TEMPLATES = {
  UserProfile: ["UserProfile.create", "UserProfile.update", "UserProfile.status", "UserProfile.export"],
  AccessibleFacility: ["AccessibleFacility.create", "AccessibleFacility.update", "AccessibleFacility.status", "AccessibleFacility.export"],
  RoutePlan: ["RoutePlan.create", "RoutePlan.update", "RoutePlan.status", "RoutePlan.export"],
  AssistanceRequest: ["AssistanceRequest.create", "AssistanceRequest.update", "AssistanceRequest.status", "AssistanceRequest.export", "AssistanceRequest.dispatch"],
  BarrierReport: ["BarrierReport.create", "BarrierReport.update", "BarrierReport.status", "BarrierReport.export"],
  FacilityClosure: ["FacilityClosure.create", "FacilityClosure.release", "FacilityClosure.rollback", "FacilityClosure.replay", "FacilityClosure.export"]
};
