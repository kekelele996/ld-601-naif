import { useEffect, useMemo, useState } from "react";
import { listAccessibleFacility } from "../api/AccessibleFacility";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import { FacilityTag } from "../components/common/FacilityTag";
import { FacilityLockdownPanel } from "../components/facility/FacilityLockdownPanel";

export function FacilitiesPage() {
  const [facilities, setFacilities] = useState<AccessibleFacility[]>([]);
  const [floor, setFloor] = useState<string>("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    listAccessibleFacility()
      .then((rows) => {
        setFacilities(rows);
        setSelectedId((prev) => prev ?? Number(rows[0]?.id ?? null));
      })
      .catch(() => undefined);
  }, []);

  const floors = useMemo(
    () => ["ALL", ...Array.from(new Set(facilities.map((row) => String(row.floor))))],
    [facilities]
  );
  const visible = useMemo(
    () => (floor === "ALL" ? facilities : facilities.filter((row) => String(row.floor) === floor)),
    [facilities, floor]
  );
  const selected = facilities.find((row) => Number(row.id) === Number(selectedId)) ?? null;

  return (
    <section className="facilities-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>设施巡检 · 封控闭环</h1>
          <p className="muted">巡检员因障碍封控设施：受影响路线立即停用，已发出协助请求退回待重派；解除时仍有待核实障碍则路线保持高风险并禁止派单。</p>
        </div>
        <FacilityTag title="当前设施" value={selected?.status ?? "UNKNOWN"} />
      </div>

      <div className="filter-bar">
        {floors.map((value) => (
          <button key={value} className={floor === value ? "active" : ""} onClick={() => setFloor(value)}>
            {value === "ALL" ? "全部楼层" : value}
          </button>
        ))}
      </div>

      <div className="workbench lockdown-layout">
        <div className="panel wide">
          <h2>设施列表</h2>
          <div className="table">
            {visible.map((facility) => (
              <article
                key={facility.id}
                className={"row selectable" + (Number(facility.id) === Number(selectedId) ? " chosen" : "")}
                onClick={() => setSelectedId(Number(facility.id))}
              >
                <strong>
                  #{facility.id} {facility.name}
                </strong>
                <span className="muted">{facility.location_code}</span>
                <FacilityTag title={facility.floor} value={facility.status} />
              </article>
            ))}
          </div>
        </div>

        {selected && (
          <FacilityLockdownPanel
            key={selected.id}
            facilityId={Number(selected.id)}
            facilityName={`#${selected.id} ${selected.name}`}
          />
        )}
      </div>
    </section>
  );
}
