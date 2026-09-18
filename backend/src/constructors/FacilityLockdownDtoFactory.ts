import type { FacilityLockdown } from "../models/FacilityLockdown";

export const createFacilityLockdownDto = (
  overrides: Partial<FacilityLockdown> = {}
): FacilityLockdown => ({
  id: 1,
  facility_id: 1,
  inspector_id: 1,
  impact_scope: "",
  expected_release_at: "",
  status: "ACTIVE",
  idempotency_key: "",
  release_idempotency_key: null,
  route_snapshots: [],
  affected_route_ids: [],
  returned_assistance_ids: [],
  unresolved_barrier_on_release: false,
  created_at: "",
  released_at: null,
  ...overrides
});
