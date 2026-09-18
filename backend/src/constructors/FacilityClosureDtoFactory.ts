import type { FacilityClosure } from "../models/FacilityClosure";
import type { PreviousRouteState } from "../models/FacilityClosure";

export const createPreviousRouteStateDto = (overrides: Partial<PreviousRouteState> = {}): PreviousRouteState => ({
  route_plan_id: 1,
  active: true,
  dispatch_allowed: true,
  risk_level: "LOW",
  ...overrides
});

export const createFacilityClosureDto = (overrides: Partial<FacilityClosure> = {}): FacilityClosure => ({
  id: 1,
  facility_id: 1,
  inspector_id: 1,
  impact_scope: "影响 B1 换乘大厅 1 号电梯覆盖的全部无障碍路线",
  estimated_released_at: "2026-09-18T12:00:00Z",
  status: "ACTIVE",
  created_at: "2026-09-18T06:00:00Z",
  released_at: null,
  released_by: null,
  affected_route_ids: [],
  returned_request_ids: [],
  pending_barrier_on_release: false,
  previous_facility_status: "AVAILABLE",
  previous_route_states: [],
  ...overrides
});

export const createFacilityClosureForm = createFacilityClosureDto;
export const createFacilityClosureResponse = createFacilityClosureDto;
