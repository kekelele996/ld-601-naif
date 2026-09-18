export interface DispatchAssistancePayload {
  helper_id?: number;
  idempotency_key?: string;
}

export type DispatchAssistanceBody = Partial<DispatchAssistancePayload>;
