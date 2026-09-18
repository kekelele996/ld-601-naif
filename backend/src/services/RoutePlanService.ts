import { routePlanRepository } from "../repositories/RoutePlanRepository";
import type { RoutePlan } from "../models/RoutePlan";

export const routePlanService = { list: () => routePlanRepository.findAll(), create: (row: unknown) => routePlanRepository.save(row as RoutePlan) };
