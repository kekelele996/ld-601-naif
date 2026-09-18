export interface CreateFacilityClosurePayload {
  facility_id: number;
  impact_scope: string;
  estimated_released_at: string;
  idempotency_key?: string;
}

export type CreateFacilityClosureBody = Partial<CreateFacilityClosurePayload>;
