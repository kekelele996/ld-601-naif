import type { Request, Response } from "express";
import { assistanceRequestService } from "../services/AssistanceRequestService";
import { asyncRoute } from "../utils/controllerResponse";
import { runIdempotent, replayLogTemplate } from "../utils/idempotentRunner";
import { auditLogService } from "../services/AuditLogService";

const readActorId = (req: Request): number => Number((req as unknown as { user?: { id?: number } }).user?.id ?? 1);
const readKey = (req: Request): string | undefined => (req.header("idempotency-key") as string | undefined) ?? (req.body as { idempotency_key?: string })?.idempotency_key;

// controller 包装：list/create 保持薄封装；派单动作单独包装 service 的业务异常
export const assistanceRequestController = {
  list: asyncRoute((_req: Request, res: Response) => res.json(assistanceRequestService.list())),
  create: asyncRoute((req: Request, res: Response) => res.status(201).json(assistanceRequestService.create(req.body))),
  dispatch: asyncRoute(async (req: Request, res: Response) => {
    const actorId = readActorId(req);
    const key = readKey(req);
    const requestId = Number(req.params.id);
    const helperId = Number(req.body?.helper_id ?? 0);
    const outcome = await runIdempotent(
      "assistance-request:dispatch",
      key,
      { request_id: requestId, helper_id: helperId },
      () => assistanceRequestService.dispatch(requestId, helperId, actorId),
      () => auditLogService.record(actorId, replayLogTemplate, "AssistanceRequest", requestId)
    );
    if (outcome.replay) res.setHeader("X-Idempotency-Replay", "1");
    res.status(outcome.status).json(outcome.body);
  })
};
