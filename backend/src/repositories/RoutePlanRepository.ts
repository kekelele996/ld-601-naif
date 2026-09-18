import { seed } from "../seed"; export const routePlanRepository = { findAll: () => seed.routePlan, save: (row: unknown) => row };
