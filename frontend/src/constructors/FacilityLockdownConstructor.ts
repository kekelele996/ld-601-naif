import type { FacilityLockdown, FacilityLockdownForm } from "../types/FacilityLockdown";

let clientSeq = 0;
/** Stable per-submit key so refresh / double click replays are de-duped server-side. */
export const createIdempotencyKey = (prefix = "fe"): string =>
  `${prefix}-${Date.now().toString(36)}-${(clientSeq += 1)}`;

export const createDefaultFacilityLockdownForm = (
  facilityId: number,
  overrides: Partial<FacilityLockdownForm> = {}
): FacilityLockdownForm => ({
  facility_id: facilityId,
  impact_scope: "",
  expected_release_at: "",
  idempotency_key: createIdempotencyKey("lock"),
  ...overrides
});

export const createDefaultFacilityLockdown = (
  overrides: Partial<FacilityLockdown> = {}
): FacilityLockdown => ({
  id: 0,
  facility_id: 0,
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

export const createFacilityLockdownResponse = createDefaultFacilityLockdown;
