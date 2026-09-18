# 无障碍出行协助平台

面向视障、轮椅和行动不便人群的室内外无障碍路线协助系统，聚合站点、设施、路线、志愿协助与障碍上报流程。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20101>

后端健康检查：<http://localhost:21101/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + TypeORM |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `accessroute`
- `FRONTEND_PORT`: 前端端口，默认 `20101`
- `BACKEND_PORT`: 后端端口，默认 `21101`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: accessroute`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-accessroute}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- MobilityType: constants/MobilityType、types/MobilityType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- FacilityStatus: constants/FacilityStatus、types/FacilityStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssistanceStatus: constants/AssistanceStatus、types/AssistanceStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- FacilityClosureStatus（封控闭环新增）:
  - 后端：`constants/FacilityClosureStatus.ts`、`models/FacilityClosure.ts`、`repositories/FacilityClosureRepository.ts`、`services/FacilityClosureService.ts`、`constructors/FacilityClosureDtoFactory.ts`、`constants/logTemplates.ts`、`constants/errorCodes.ts`、`constants/errorMessages.ts`、`controllers/FacilityClosureController.ts`、`routes/FacilityClosureRoutes.ts`、`database/init.sql`（部分唯一索引）。
  - 前端：`constants/FacilityClosureStatus.ts`、`types/FacilityClosure.ts`、`constructors/FacilityClosureConstructor.ts`、`constants/statusText.ts`、`constants/logTemplates.ts`、`constants/errorCodes.ts`、`constants/errorMessages.ts`、`api/FacilityClosure.ts`、`api/http.ts`、`stores/FacilityClosureStore.ts`、`hooks/useFacilityClosureFlow.ts`、`pages/FacilitiesPage.tsx`。
- BarrierVerifyStatus（待核实障碍判定）: 后端 `constants/BarrierVerifyStatus.ts`、`repositories/BarrierReportRepository.ts`；前端 `constants/BarrierVerifyStatus.ts`、`pages/FacilitiesPage.tsx`、`constants/statusText.ts`。
- RouteRiskLevel（路线风险/高风险禁派）: 后端 `constants/RouteRiskLevel.ts`、`repositories/RoutePlanRepository.ts`；前端 `constants/RouteRiskLevel.ts`、`components/common/RouteRiskPanel.tsx`、`pages/FacilitiesPage.tsx`、`constants/statusText.ts`。

## 设施封控闭环（/facilities 页面）

巡检员在「设施巡检」页对设施发起封控，业务规则：

1. 封控必须填写**影响范围**与**预计解除时间**（晚于当前时间）。
2. 封控生效后：设施变为 `BLOCKED`；引用该设施的路线立即停用（`active=false`、`dispatch_allowed=false`）；已派单（REQUESTED/ACCEPTED）的协助请求退回待重派（清空志愿者、`redispatch_required=true`）。
3. 解除时：设施恢复封控前状态；若该设施仍有 `PENDING` 障碍单，路线**保持 HIGH 高风险并禁止派单**，否则按封控前快照恢复。
4. 同一设施至多一条 ACTIVE 封控：重复提交返回 `409 CLOSURE_ALREADY_ACTIVE`，并发提交经设施级互斥串行化（30 并发压测仅 1 条 201）。
5. 并发解除经封控记录级互斥 + `claimActiveById` 抢占保证只生效一次；写操作必须携带 `Idempotency-Key` 请求头（或 `idempotency_key` 字段），刷新重放直接返回首次响应并带 `X-Idempotent-Replay: 1`，同键不同载荷返回 `409 IDEMPOTENCY_CONFLICT`。
6. 任一步校验失败时，`runInTransaction` 回滚全量内存快照，设施、路线和协助请求保持原样。
7. 重新派单接口在路线停用或高风险禁派时返回 `409 ROUTE_DISPATCH_FORBIDDEN`。

接口：`POST /api/facility-closure`（封控）、`POST /api/facility-closure/:id/release`（解除）、`GET /api/facility-closure`（回读）、`GET /api/facility-closure/facility/:facilityId/active`、`POST /api/assistance-request/:id/dispatch`（重新派单）。前端运行时冒烟：`cd frontend && npm run smoke`（需后端运行在 `localhost:3000`）。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
