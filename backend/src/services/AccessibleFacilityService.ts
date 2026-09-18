import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import type { AccessibleFacility } from "../models/AccessibleFacility";

export const accessibleFacilityService = { list: () => accessibleFacilityRepository.findAll(), create: (row: unknown) => accessibleFacilityRepository.save(row as AccessibleFacility) };
