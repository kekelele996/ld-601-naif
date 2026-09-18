import { seed } from "../seed";
import type { AccessibleFacility } from "../models/AccessibleFacility";
import type { RoutePlan } from "../models/RoutePlan";
import type { AssistanceRequest } from "../models/AssistanceRequest";
import type { BarrierReport } from "../models/BarrierReport";
import type { UserProfile } from "../models/UserProfile";
import type { FacilityLockdown } from "../models/FacilityLockdown";

/**
 * Single mutable in-memory database.
 *
 * The seed module ships read-only review data; the closure feature mutates
 * facilities, routes, assistance requests and lockdown records in place, so
 * every repository reads and writes through these deep-cloned mutable tables.
 */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const db: {
  userProfile: UserProfile[];
  accessibleFacility: AccessibleFacility[];
  routePlan: RoutePlan[];
  assistanceRequest: AssistanceRequest[];
  barrierReport: BarrierReport[];
  facilityLockdown: FacilityLockdown[];
} = {
  userProfile: clone(seed.userProfile) as unknown as UserProfile[],
  accessibleFacility: clone(seed.accessibleFacility) as unknown as AccessibleFacility[],
  routePlan: clone(seed.routePlan) as unknown as RoutePlan[],
  assistanceRequest: clone(seed.assistanceRequest) as unknown as AssistanceRequest[],
  barrierReport: clone(seed.barrierReport) as unknown as BarrierReport[],
  facilityLockdown: []
};

export type Db = typeof db;

