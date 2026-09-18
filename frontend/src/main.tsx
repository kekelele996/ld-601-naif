import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { mockData } from "./mocks/seedData";
import { StatusBadge } from "./components/common/StatusBadge";
import { StatCard } from "./components/common/StatCard";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import "antd/dist/reset.css";
import "./styles.css";

function OverviewPage({ name }: { name: string }) {
  const entities = Object.entries(mockData).filter(([key]) => key !== "facilityClosure");
  const total = useMemo(() => entities.reduce((sum, [, rows]) => sum + rows.length, 0), [entities]);
  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">accessroute</p>
        <h1>{name}</h1>
      </div>
      <StatusBadge value="LOCAL_DATA" />
    </section>
    <section className="metrics">
      <StatCard label="核心模型" value={entities.length} />
      <StatCard label="本地记录" value={total} />
      <StatCard label="共享枚举" value={3} />
    </section>
    <section className="workbench">
      <div className="panel wide">
        <h2>业务数据</h2>
        <div className="table">
          {entities.map(([key, rows]) => <article key={key} className="row">
            <strong>{key}</strong><span>{rows.length} 条</span><StatusBadge value={String(Object.values(rows[0] ?? {})[1] ?? "READY")} />
          </article>)}
        </div>
      </div>
      <div className="panel">
        <h2>联动检查</h2>
        <p>页面、store、API、构造器、日志模板和枚举常量均按提示词拆分，适合评审跨文件修改能力。</p>
        <p>设施封控闭环请进入「设施巡检」页面完成封控、解除并回读状态。</p>
      </div>
    </section>
  </main>;
}

function ActivePage({ name, route }: { name: string; route: string }) {
  if (route === "/facilities") return <FacilitiesPage />;
  return <OverviewPage name={name} />;
}

function App() {
  const [active, setActive] = useState<string>(routes.find((route) => route.route === "/facilities")?.route ?? routes[0]?.route ?? "/dashboard");
  const current = routes.find((route) => route.route === active) ?? routes[0];
  return <div className="shell">
    <aside>
      <div className="brand">无障碍出行协助平台</div>
      <nav>{routes.map((route) => <button key={route.route} className={active === route.route ? "active" : ""} onClick={() => setActive(route.route)}>{route.name}</button>)}</nav>
    </aside>
    <ActivePage name={current?.name ?? "工作台"} route={current?.route ?? "/dashboard"} />
  </div>;
}

createRoot(document.getElementById("root")!).render(<App />);
