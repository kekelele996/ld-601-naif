export interface ReleaseFacilityClosurePayload {
  idempotency_key?: string;
}

export type ReleaseFacilityClosureBody = Partial<ReleaseFacilityClosurePayload>;
