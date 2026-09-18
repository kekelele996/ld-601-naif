import type { FacilityLockdown, FacilityLockdownForm, FacilityLockdownStatus } from "../types/FacilityLockdown";
import { createIdempotencyKey } from "../constructors/FacilityLockdownConstructor";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toApiError } from "./http";

const endpoint = "/api/facility-lockdown";

export async function listFacilityLockdown(): Promise<FacilityLockdown[]> {
  const res = await fetch(`${endpoint}/`);
  if (!res.ok) throw await toApiError(res);
  return res.json();
}

export async function fetchFacilityLockdownStatus(facilityId: number): Promise<FacilityLockdownStatus> {
  const res = await fetch(`${endpoint}/facility/${facilityId}/status`);
  if (!res.ok) throw await toApiError(res);
  console.info(LOG_TEMPLATES.FacilityLockdown[2], facilityId);
  return res.json();
}

export async function lockdownFacility(form: FacilityLockdownForm): Promise<FacilityLockdown> {
  console.info(LOG_TEMPLATES.AccessibleFacility[4], form);
  const res = await fetch(`/api/facility-lockdown/facility/${form.facility_id}/lockdown`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      facility_id: form.facility_id,
      impact_scope: form.impact_scope,
      expected_release_at: form.expected_release_at,
      // Key is generated once per submit; refresh replay reuses a consumed key and is rejected.
      idempotency_key: form.idempotency_key || createIdempotencyKey("lock")
    })
  });
  if (!res.ok) throw await toApiError(res);
  return res.json();
}

export async function releaseFacilityLockdown(
  facilityId: number,
  releaseKey: string = createIdempotencyKey("release")
): Promise<FacilityLockdown> {
  console.info(LOG_TEMPLATES.AccessibleFacility[5], { facilityId, releaseKey });
  const res = await fetch(`/api/facility-lockdown/facility/${facilityId}/release`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ release_idempotency_key: releaseKey })
  });
  if (!res.ok) throw await toApiError(res);
  return res.json();
}
