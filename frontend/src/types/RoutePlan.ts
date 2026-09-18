export interface RoutePlan {
  id: number;
  user_id: number;
  origin_text: string;
  destination_text: string;
  route_mode: string;
  risk_level: string;
  estimated_minutes: number;
  facility_ids: number[];
  created_at: string;
  dispatch_status?: string;
  locked_by_lockdown_id?: number | null;
}
