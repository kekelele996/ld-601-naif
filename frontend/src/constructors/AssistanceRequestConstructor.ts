import type { AssistanceRequest } from "../types/AssistanceRequest";

export const createDefaultAssistanceRequest = (overrides: Partial<AssistanceRequest> = {}): AssistanceRequest => ({
  id: 1 as never,
  user_id: 1 as never,
  route_plan_id: 1 as never,
  helper_id: 0,
  request_time: "2026-06-11T09:00:00Z" as never,
  status: "REQUESTED" as never,
  meet_point: "meet point 1" as never,
  contact_note: "contact note 1" as never,
  redispatch_required: false,
  ...overrides
});

export const createAssistanceRequestForm = createDefaultAssistanceRequest;
export const createAssistanceRequestResponse = createDefaultAssistanceRequest;
