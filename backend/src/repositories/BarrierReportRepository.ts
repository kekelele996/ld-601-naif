import { seed } from "../seed"; export const barrierReportRepository = { findAll: () => seed.barrierReport, save: (row: unknown) => row };
