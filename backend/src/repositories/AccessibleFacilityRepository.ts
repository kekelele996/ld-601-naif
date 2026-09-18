import { db } from "./db";

export const accessibleFacilityRepository = {
  findAll: () => db.accessibleFacility,
  findById: (id: number) => db.accessibleFacility.find((row) => Number(row.id) === Number(id)) ?? null,
  save: (row: unknown) => row
};
