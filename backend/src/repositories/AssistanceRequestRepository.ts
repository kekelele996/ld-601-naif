import { db } from "./db";

// Requests that have already been dispatched and must be returned for re-dispatch
// when the route they rely on is suspended by a facility lockdown.
const DISPATCHED_STATUSES = ["REQUESTED", "ACCEPTED", "ARRIVED"];

export const assistanceRequestRepository = {
  findAll: () => db.assistanceRequest,
  findById: (id: number) => db.assistanceRequest.find((row) => Number(row.id) === Number(id)) ?? null,
  findDispatchedByRouteIds: (routeIds: number[]) =>
    db.assistanceRequest.filter(
      (row) =>
        routeIds.map(Number).includes(Number(row.route_plan_id)) &&
        DISPATCHED_STATUSES.includes(String(row.status))
    ),
  save: (row: unknown) => row
};
