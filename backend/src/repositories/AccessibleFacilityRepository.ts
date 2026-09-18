import { seed } from "../seed"; export const accessibleFacilityRepository = { findAll: () => seed.accessibleFacility, save: (row: unknown) => row };
