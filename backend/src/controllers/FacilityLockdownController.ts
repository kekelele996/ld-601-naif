import type { Request, Response, NextFunction } from "express";
import { facilityLockdownService } from "../services/FacilityLockdownService";
import { BusinessError } from "../utils/businessError";

/**
 * Controller wraps service errors separately from the global handler: business
 * errors are re-thrown (kept intact), transport errors get a VALIDATION_FAILED.
 */
const wrap = (handler: (req: Request, res: Response) => unknown) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof BusinessError) {
        next(error);
      } else {
        next(new BusinessError("VALIDATION_FAILED", 400, (error as Error).message));
      }
    }
  };

export const facilityLockdownController = {
  list: wrap(async (_req: Request, res: Response) => {
    res.json(facilityLockdownService.list());
  }),

  status: wrap(async (req: Request, res: Response) => {
    res.json(facilityLockdownService.status(Number(req.params.facilityId)));
  }),

  lockdown: wrap(async (req: Request, res: Response) => {
    const created = await facilityLockdownService.lockdown({
      facility_id: req.body.facility_id,
      impact_scope: req.body.impact_scope,
      expected_release_at: req.body.expected_release_at,
      idempotency_key: req.body.idempotency_key,
      inspector_id: (req as unknown as { user?: { id?: number } }).user?.id ?? req.body.inspector_id
    });
    res.status(201).json(created);
  }),

  release: wrap(async (req: Request, res: Response) => {
    const released = await facilityLockdownService.release({
      facility_id: req.params.facilityId,
      release_idempotency_key: req.body.release_idempotency_key ?? req.body.idempotency_key
    });
    res.json(released);
  })
};
