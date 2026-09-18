import type { Request, Response } from "express";
import { facilityClosureService } from "../services/FacilityClosureService";
import { asyncRoute } from "../utils/controllerResponse";
import { runIdempotent, replayLogTemplate } from "../utils/idempotentRunner";
import { auditLogService } from "../services/AuditLogService";

const readActorId = (req: Request): number => Number((req as unknown as { user?: { id?: number } }).user?.id ?? 1);
const readKey = (req: Request): string | undefined => (req.header("idempotency-key") as string | undefined) ?? (req.body as { idempotency_key?: string })?.idempotency_key;

// controller 层包装：解析 HTTP 入参、调用 service、分别处理业务异常与幂等重放
export const facilityClosureController = {
  list: asyncRoute((_req: Request, res: Response) => res.json(facilityClosureService.list())),
  detail: asyncRoute((req: Request, res: Response) => res.json(facilityClosureService.get(Number(req.params.id)))),
  activeByFacility: asyncRoute((req: Request, res: Response) => {
    const closure = facilityClosureService.getActiveByFacility(Number(req.params.facilityId));
    if (!closure) return res.status(404).json({ code: "CLOSURE_NOT_FOUND", message: "facility has no active closure" });
    return res.json(closure);
  }),
  create: asyncRoute(async (req: Request, res: Response) => {
    const actorId = readActorId(req);
    const key = readKey(req);
    const outcome = await runIdempotent(
      "facility-closure:create",
      key,
      { body: req.body, facility_id: req.body?.facility_id },
      () => facilityClosureService.close(req.body ?? {}, actorId),
      () => auditLogService.record(actorId, replayLogTemplate, "FacilityClosure", req.body?.facility_id ?? 0)
    );
    if (outcome.replay) res.setHeader("X-Idempotent-Replay", "1");
    res.status(outcome.status).json(outcome.body);
  }),
  release: asyncRoute(async (req: Request, res: Response) => {
    const actorId = readActorId(req);
    const key = readKey(req);
    const closureId = Number(req.params.id);
    const outcome = await runIdempotent(
      "facility-closure:release",
      key,
      { closure_id: closureId },
      () => facilityClosureService.release(closureId, actorId),
      () => auditLogService.record(actorId, replayLogTemplate, "FacilityClosure", closureId)
    );
    if (outcome.replay) res.setHeader("X-Idempotent-Replay", "1");
    res.status(outcome.status).json(outcome.body);
  })
};
