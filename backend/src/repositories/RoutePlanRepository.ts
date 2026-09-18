import { memoryStore, deepClone } from "./memoryStore";
import type { RoutePlan } from "../models/RoutePlan";

export const routePlanRepository = {
  findAll: (): RoutePlan[] => deepClone(memoryStore.routePlan),
  findByFacilityId: (facilityId: number): RoutePlan[] => deepClone(memoryStore.routePlan.filter((row) => row.facility_ids.includes(facilityId))),
  findById: (id: number): RoutePlan | undefined => {
    const row = memoryStore.routePlan.find((item) => item.id === id);
    return row ? deepClone(row) : undefined;
  },
  // 封控：受影响路线立即停用并禁止派单
  deactivateForClosure: (ids: number[]): void => {
    memoryStore.routePlan.forEach((row) => {
      if (ids.includes(row.id)) {
        row.active = false;
        row.dispatch_allowed = false;
      }
    });
  },
  // 解除：按封控前快照恢复，或按待核实障碍规则保持高风险禁止派单
  restoreAfterRelease: (snapshots: { route_plan_id: number; active: boolean; dispatch_allowed: boolean; risk_level: string }[], pendingBarrier: boolean): void => {
    snapshots.forEach((snapshot) => {
      const row = memoryStore.routePlan.find((item) => item.id === snapshot.route_plan_id);
      if (!row) return;
      if (pendingBarrier) {
        row.active = true;
        row.dispatch_allowed = false;
        row.risk_level = "HIGH";
      } else {
        row.active = snapshot.active;
        row.dispatch_allowed = snapshot.dispatch_allowed;
        row.risk_level = snapshot.risk_level;
      }
    });
  },
  save: (row: RoutePlan): RoutePlan => deepClone(row)
};
