import type { RoutePlan } from "../types/RoutePlan";

export const createDefaultRoutePlan = (overrides: Partial<RoutePlan> = {}): RoutePlan => ({
  id: 1 as never,
  user_id: 1 as never,
  origin_text: "origin text 1" as never,
  destination_text: "destination text 1" as never,
  route_mode: "route mode 1" as never,
  risk_level: "LOW" as never,
  estimated_minutes: "estimated minutes 1" as never,
  facility_ids: [1,2] as number[],
  created_at: "2026-06-11T09:00:00Z" as never,
  ...overrides
});

export const createRoutePlanForm = createDefaultRoutePlan;
export const createRoutePlanResponse = createDefaultRoutePlan;
