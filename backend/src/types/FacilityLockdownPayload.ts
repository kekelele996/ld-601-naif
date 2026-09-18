export interface FacilityLockdownPayload {
  facility_id?: number | string;
  impact_scope?: string;
  expected_release_at?: string;
  idempotency_key?: string;
  release_idempotency_key?: string;
  inspector_id?: number | string;
}
