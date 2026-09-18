export interface RouteSnapshot {
  route_id: number;
  risk_level: string;
  dispatch_status: string;
}

export interface FacilityLockdown {
  id: number;
  facility_id: number;
  inspector_id: number;
  impact_scope: string;
  expected_release_at: string;
  status: string;
  idempotency_key: string;
  release_idempotency_key: string | null;
  route_snapshots: RouteSnapshot[];
  affected_route_ids: number[];
  returned_assistance_ids: number[];
  unresolved_barrier_on_release: boolean;
  created_at: string;
  released_at: string | null;
}

export interface FacilityLockdownForm {
  facility_id: number;
  impact_scope: string;
  expected_release_at: string;
  idempotency_key: string;
}

export interface FacilityLockdownStatus {
  facility: {
    id: number;
    name: string;
    facility_type: string;
    location_code: string;
    floor: string;
    status: string;
    last_checked_at: string;
  };
  lockdown: FacilityLockdown | null;
  routes: Array<{
    id: number;
    origin_text: string;
    destination_text: string;
    risk_level: string;
    dispatch_status?: string;
  }>;
  assistance: Array<{
    id: number;
    route_plan_id: number;
    status: string;
    helper_id: number;
  }>;
  barrierReports: Array<{
    id: number;
    verify_status: string;
    description: string;
  }>;
}
