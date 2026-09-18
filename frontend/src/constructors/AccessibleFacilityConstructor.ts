import type { AccessibleFacility } from "../types/AccessibleFacility";

export const createDefaultAccessibleFacility = (overrides: Partial<AccessibleFacility> = {}): AccessibleFacility => ({
  id: 1 as never,
  facility_type: "LOW_VISION" as never,
  name: "name 1" as never,
  location_code: "location code 1" as never,
  floor: "floor 1" as never,
  status: "BLOCKED" as never,
  last_checked_at: "2026-06-11T09:00:00Z" as never,
  owner_department: "owner department 1" as never,
  note: "note 1" as never,
  ...overrides
});

export const createAccessibleFacilityForm = createDefaultAccessibleFacility;
export const createAccessibleFacilityResponse = createDefaultAccessibleFacility;
