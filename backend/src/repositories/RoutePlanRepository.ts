import { db } from "./db";

export const routePlanRepository = {
  findAll: () => db.routePlan,
  findById: (id: number) => db.routePlan.find((row) => Number(row.id) === Number(id)) ?? null,
  findByFacilityId: (facilityId: number) =>
    db.routePlan.filter((row) => (row.facility_ids as unknown as number[]).map(Number).includes(Number(facilityId))),
  save: (row: unknown) => row
};
