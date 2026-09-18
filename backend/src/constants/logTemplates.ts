export const LOG_TEMPLATES = {
  UserProfile: ["UserProfile.create", "UserProfile.update", "UserProfile.status", "UserProfile.export"],
  AccessibleFacility: ["AccessibleFacility.create", "AccessibleFacility.update", "AccessibleFacility.status", "AccessibleFacility.export", "AccessibleFacility.lockdown", "AccessibleFacility.release"],
  RoutePlan: ["RoutePlan.create", "RoutePlan.update", "RoutePlan.status", "RoutePlan.export", "RoutePlan.suspend", "RoutePlan.riskHold", "RoutePlan.restore"],
  AssistanceRequest: ["AssistanceRequest.create", "AssistanceRequest.update", "AssistanceRequest.status", "AssistanceRequest.export", "AssistanceRequest.returnForDispatch"],
  BarrierReport: ["BarrierReport.create", "BarrierReport.update", "BarrierReport.status", "BarrierReport.export"],
  FacilityLockdown: ["FacilityLockdown.create", "FacilityLockdown.release", "FacilityLockdown.read", "FacilityLockdown.export", "FacilityLockdown.replayRejected"]
};
