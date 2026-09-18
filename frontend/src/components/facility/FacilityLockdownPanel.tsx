import { useEffect, useMemo, useState } from "react";
import { useFacilityLockdownStore } from "../../stores/FacilityLockdownStore";
import { createDefaultFacilityLockdownForm } from "../../constructors/FacilityLockdownConstructor";
import { formatDate, formatDispatchStatus, formatRisk, formatVerifyStatus, riskBadgeValue } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";
import type { FacilityLockdownForm, FacilityLockdownStatus } from "../../types/FacilityLockdown";

/**
 * Drives the facility lockdown closed loop for one facility:
 * lock (impact scope + expected release time), release, and read-back of the
 * resulting facility / route / assistance state.
 */
export function FacilityLockdownPanel({ facilityId, facilityName }: { facilityId: number; facilityName: string }) {
  const statusByFacility = useFacilityLockdownStore((s) => s.statusByFacility);
  const acting = useFacilityLockdownStore((s) => s.acting);
  const error = useFacilityLockdownStore((s) => s.error);
  const lastAction = useFacilityLockdownStore((s) => s.lastAction);
  const refreshStatus = useFacilityLockdownStore((s) => s.refreshStatus);
  const lockdown = useFacilityLockdownStore((s) => s.lockdown);
  const release = useFacilityLockdownStore((s) => s.release);

  const [form, setForm] = useState<FacilityLockdownForm>(() => createDefaultFacilityLockdownForm(facilityId));

  useEffect(() => {
    refreshStatus(facilityId).catch(() => undefined);
  }, [facilityId, refreshStatus, lastAction]);

  const status: FacilityLockdownStatus | undefined = statusByFacility[facilityId];
  const active = status?.lockdown?.status === "ACTIVE";

  const hasUnverifiedBarrier = useMemo(
    () => (status?.barrierReports ?? []).some((report) => formatVerifyStatus(report.verify_status) === "待核实"),
    [status]
  );

  const update = (patch: Partial<FacilityLockdownForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const submitLockdown = async () => {
    // Fresh key for a genuine new attempt; a rejected replay keeps the consumed key.
    await lockdown({ ...form, facility_id: facilityId, idempotency_key: form.idempotency_key });
    setForm(createDefaultFacilityLockdownForm(facilityId));
  };

  const submitRelease = async () => {
    await release(facilityId);
  };

  return (
    <div className="panel lockdown-panel">
      <div className="row" style={{ gridTemplateColumns: "1fr auto" }}>
        <strong>{facilityName}</strong>
        <StatusBadge value={status?.facility.status ?? "UNKNOWN"} />
      </div>

      {status?.lockdown && (
        <p className="lockdown-meta">
          当前封控：<StatusBadge value={status.lockdown.status} />
          {status.lockdown.status === "ACTIVE" && (
            <>
              <span>影响范围：{status.lockdown.impact_scope}</span>
              <span>预计解除：{formatDate(status.lockdown.expected_release_at)}</span>
            </>
          )}
          {status.lockdown.status === "RELEASED" && (
            <span>
              解除于 {formatDate(status.lockdown.released_at ?? "")}
              {status.lockdown.unresolved_barrier_on_release ? "（仍有待核实障碍）" : "（障碍已清零）"}
            </span>
          )}
        </p>
      )}

      {!active && (
        <div className="lockdown-form">
          <label>
            影响范围
            <input
              value={form.impact_scope}
              placeholder="如：东侧坡道、3F 电梯井"
              onChange={(event) => update({ impact_scope: event.target.value })}
            />
          </label>
          <label>
            预计解除时间
            <input
              type="datetime-local"
              value={form.expected_release_at}
              onChange={(event) => update({ expected_release_at: event.target.value })}
            />
          </label>
          <button className="primary" disabled={acting} onClick={submitLockdown}>
            封控设施
          </button>
        </div>
      )}

      {active && (
        <button className="danger" disabled={acting} onClick={submitRelease}>
          解除封控{hasUnverifiedBarrier ? "（存在待核实障碍）" : ""}
        </button>
      )}

      {error && <p className="form-error">{error}</p>}
      {lastAction && !error && <p className="form-ok">{lastAction}</p>}

      <div className="readback">
        <h3>受影响路线（回读）</h3>
        <div className="table">
          {(status?.routes ?? []).length === 0 && <p className="empty">暂无关联路线</p>}
          {(status?.routes ?? []).map((route) => (
            <article key={route.id} className="row">
              <strong>
                #{route.id} {route.origin_text} → {route.destination_text}
              </strong>
              <StatusBadge value={riskBadgeValue(route.risk_level)} />
              <span className="muted">{formatRisk(route.risk_level)}风险</span>
              <StatusBadge value={route.dispatch_status ?? "DISPATCHABLE"} />
              <span className="muted">{formatDispatchStatus(route.dispatch_status)}</span>
            </article>
          ))}
        </div>

        <h3>关联协助请求（回读）</h3>
        <div className="table">
          {(status?.assistance ?? []).length === 0 && <p className="empty">暂无关联协助请求</p>}
          {(status?.assistance ?? []).map((request) => (
            <article key={request.id} className="row">
              <strong>#{request.id}</strong>
              <span className="muted">路线 #{request.route_plan_id}</span>
              <StatusBadge value={request.status} />
            </article>
          ))}
        </div>

        <h3>障碍工单（回读）</h3>
        <div className="table">
          {(status?.barrierReports ?? []).length === 0 && <p className="empty">暂无障碍工单</p>}
          {(status?.barrierReports ?? []).map((report) => (
            <article key={report.id} className="row">
              <strong>#{report.id}</strong>
              <span className="muted">{report.description}</span>
              <StatusBadge value={report.verify_status} />
              <span className="muted">{formatVerifyStatus(report.verify_status)}</span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
