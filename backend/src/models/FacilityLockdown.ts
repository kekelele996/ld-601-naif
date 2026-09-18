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
