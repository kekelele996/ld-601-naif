import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { listAccessibleFacility } from "../api/AccessibleFacility";
import { listRoutePlan } from "../api/RoutePlan";
import { listAssistanceRequest, dispatchAssistanceRequest } from "../api/AssistanceRequest";
import { listBarrierReport } from "../api/BarrierReport";
import { useFacilityClosureStore } from "../stores/FacilityClosureStore";
import { createIdempotencyKey } from "../api/http";
import { resolveErrorMessage } from "../constants/errorMessages";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { RoutePlan } from "../types/RoutePlan";
import type { AssistanceRequest } from "../types/AssistanceRequest";
import type { BarrierReport } from "../types/BarrierReport";
import type { FacilityClosure, CreateFacilityClosureForm } from "../types/FacilityClosure";

// 设施封控闭环页面编排：一次性回读设施/路线/协助请求/障碍单/封控记录，
// 封控、解除、重派后全部重新拉取，保证页面状态与后端一致。
// 注意：zustand 必须用细粒度 selector，避免整仓订阅导致回调身份变化引发刷新死循环。
export function useFacilityClosureFlow() {
  const closures = useFacilityClosureStore((state) => state.rows);
  const storeSubmitting = useFacilityClosureStore((state) => state.submitting);
  const loadClosures = useFacilityClosureStore((state) => state.load);
  const createClosure = useFacilityClosureStore((state) => state.close);
  const releaseClosureRow = useFacilityClosureStore((state) => state.release);

  const [facilities, setFacilities] = useState<AccessibleFacility[]>([]);
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [reports, setReports] = useState<BarrierReport[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [facilityRows, routeRows, requestRows, reportRows] = await Promise.all([
        listAccessibleFacility(),
        listRoutePlan(),
        listAssistanceRequest(),
        listBarrierReport()
      ]);
      setFacilities(facilityRows);
      setRoutes(routeRows);
      setRequests(requestRows);
      setReports(reportRows);
      await loadClosures();
    } finally {
      setLoading(false);
    }
  }, [loadClosures]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeClosureByFacility = useMemo(() => {
    const map = new Map<number, FacilityClosure>();
    closures.filter((row) => row.status === "ACTIVE").forEach((row) => map.set(row.facility_id, row));
    return map;
  }, [closures]);

  const runAction = useCallback(
    async <T,>(label: string, action: () => Promise<{ data: T; replay: boolean }>): Promise<T | null> => {
      try {
        const result = await action();
        message.success(result.replay ? `${label}：命中幂等重放，未重复生效` : `${label}成功`);
        await refresh();
        return result.data;
      } catch (error) {
        const err = error as { code?: string; message?: string };
        message.error(`${label}失败：${resolveErrorMessage(err.code, err.message)}（设施、路线与协助请求保持原样）`);
        await refresh();
        return null;
      }
    },
    [refresh]
  );

  const closeFacility = useCallback(
    (form: CreateFacilityClosureForm) =>
      runAction("封控", () => createClosure(form, createIdempotencyKey("closure-create"))),
    [createClosure, runAction]
  );

  const releaseClosure = useCallback(
    (id: number) => runAction("解除", () => releaseClosureRow(id, createIdempotencyKey("closure-release"))),
    [releaseClosureRow, runAction]
  );

  const redispatch = useCallback(
    (id: number, helperId: number) =>
      runAction("重新派单", () => dispatchAssistanceRequest(id, helperId, createIdempotencyKey("assistance-dispatch"))),
    [runAction]
  );

  return {
    loading: loading || storeSubmitting,
    acting: storeSubmitting,
    facilities,
    routes,
    requests,
    reports,
    closures,
    activeClosureByFacility,
    refresh,
    closeFacility,
    releaseClosure,
    redispatch
  };
}
