import type { FacilityClosure, PreviousRouteState, CreateFacilityClosureForm } from "../types/FacilityClosure";

export const createPreviousRouteState = (overrides: Partial<PreviousRouteState> = {}): PreviousRouteState => ({
  route_plan_id: 0,
  active: true,
  dispatch_allowed: true,
  risk_level: "LOW",
  ...overrides
});

// 封控表单默认对象：巡检员在设施巡检页弹出表单时使用
export const createFacilityClosureForm = (overrides: Partial<CreateFacilityClosureForm> = {}): CreateFacilityClosureForm => ({
  facility_id: 0,
  impact_scope: "",
  estimated_released_at: "",
  ...overrides
});

export const createDefaultFacilityClosure = (overrides: Partial<FacilityClosure> = {}): FacilityClosure => ({
  id: 0,
  facility_id: 0,
  inspector_id: 0,
  impact_scope: "",
  estimated_released_at: "",
  status: "ACTIVE",
  created_at: "",
  released_at: null,
  released_by: null,
  affected_route_ids: [],
  returned_request_ids: [],
  pending_barrier_on_release: false,
  previous_facility_status: "AVAILABLE",
  previous_route_states: [],
  ...overrides
});

export const createFacilityClosureResponse = createDefaultFacilityClosure;
