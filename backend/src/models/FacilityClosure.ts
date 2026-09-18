export interface PreviousRouteState { route_plan_id: number; active: boolean; dispatch_allowed: boolean; risk_level: string }

export interface FacilityClosure {
  id: number;
  facility_id: number;
  inspector_id: number;
  impact_scope: string;
  estimated_released_at: string;
  status: string;
  created_at: string;
  released_at: string | null;
  released_by: number | null;
  affected_route_ids: number[];
  returned_request_ids: number[];
  pending_barrier_on_release: boolean;
  previous_facility_status: string;
  previous_route_states: PreviousRouteState[];
}
