import { db } from "./db";

export const barrierReportRepository = {
  findAll: () => db.barrierReport,
  findByFacilityId: (facilityId: number) =>
    db.barrierReport.filter((row) => Number(row.facility_id) === Number(facilityId)),
  save: (row: unknown) => row
};
