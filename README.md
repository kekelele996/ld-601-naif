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

## 设施封控闭环（Facility Lockdown）

巡检员在「设施巡检」页对存在障碍的设施发起封控，形成一次性闭环：

1. **封控**：填写「影响范围」和「预计解除时间」，并携带每次提交生成的幂等键 `idempotency_key`。
   - 设施状态立即变为 `BLOCKED`；
   - 所有引用该设施的路线立即停用（`dispatch_status = SUSPENDED`，风险置为 `HIGH`）；
   - 已发出（REQUESTED/ACCEPTED/ARRIVED）的协助请求退回 `RETURNED_FOR_DISPATCH` 待重派。
2. **解除**：携带解除幂等键 `release_idempotency_key`。
   - 若设施仍存在「待核实」障碍（`verify_status = UNVERIFIED`），设施恢复 `AVAILABLE`，但路线保持 `HIGH` 高风险且 `dispatch_status = RISK_HOLD`，**禁止派单**（再发起协助请求返回 `409 ROUTE_DISPATCH_FORBIDDEN`）；
   - 若障碍已清零，路线恢复封控前风险等级并变为 `DISPATCHABLE`，可重新派单。
3. **只生效一次**：同一设施仅允许一条 `ACTIVE` 封控；重复提交（`FACILITY_ALREADY_LOCKED`）、刷新重放（`LOCKDOWN_REPLAYED`）、并发封控/解除（按设施串行化，仅一个胜出）都只生效一次。
4. **失败保持原样**：任一步校验失败（字段缺失、时间非法、设施/封控不存在等）抛出业务错误，设施、路线与协助请求通过快照回滚保持原状。
5. **回读**：`GET /api/facility-lockdown/facility/:facilityId/status` 回读设施、封控记录、受影响路线、协助请求与障碍工单的最新联动状态，页面据此展示。

后端接口（前缀 `/api/facility-lockdown`）：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/facility/:facilityId/status` | 回读设施封控联动状态 |
| POST | `/facility/:facilityId/lockdown` | 封控（body: impact_scope/expected_release_at/idempotency_key） |
| POST | `/facility/:facilityId/release` | 解除（body: release_idempotency_key） |
| GET | `/` | 封控记录列表 |


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
- LockdownStatus（ACTIVE/RELEASED）: backend 与 frontend 的 constants/LockdownStatus、models/types/FacilityLockdown、FacilityLockdownDtoFactory/Constructor、logTemplates、FacilityLockdownPanel 展示。
- RouteDispatchStatus（DISPATCHABLE/SUSPENDED/RISK_HOLD）: backend 与 frontend 的 constants/RouteDispatchStatus、models/types/RoutePlan、封控服务与协助派单守卫、utils/formatters、FacilityLockdownPanel 与状态徽标展示。
- BarrierVerifyStatus（UNVERIFIED/VERIFIED/RESOLVED）: backend 与 frontend 的 constants/BarrierVerifyStatus、解除时的待核实障碍判定、utils/formatters、回读列表展示。
- 错误码：facility-lockdown 新增 `FACILITY_NOT_FOUND/FACILITY_ALREADY_LOCKED/LOCKDOWN_NOT_FOUND/LOCKDOWN_ALREADY_RELEASED/LOCKDOWN_REPLAYED/ROUTE_DISPATCH_FORBIDDEN`，集中在前后端 `constants/errorCodes.ts` 与 `constants/errorMessages.ts`。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

新增「设施封控闭环」即典型示例：一次封控/解除会横跨 constants（LockdownStatus、RouteDispatchStatus、BarrierVerifyStatus、错误码/消息/日志模板）、models、repositories（新增可变 `db`、封控仓储与按设施互斥锁）、constructors（DTO 工厂与前端表单构造器）、services（封控编排 + 协助派单守卫）、controllers、routes、main 注册、database/init.sql，以及前端的 types、api、store、components/facility/FacilityLockdownPanel、pages/FacilitiesPage、utils/formatters、mocks 与 README，单字段改动会触达 15+ 个文件。

## License

MIT
