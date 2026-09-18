import type { Request, Response, NextFunction } from "express";
import { assistanceRequestService } from "../services/AssistanceRequestService";

const wrap = (handler: (req: Request, res: Response) => unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      handler(req, res);
    } catch (error) {
      next(error);
    }
  };

export const assistanceRequestController = {
  list: wrap((_req: Request, res: Response) => res.json(assistanceRequestService.list())),
  create: wrap((req: Request, res: Response) =>
    res.status(201).json(assistanceRequestService.create(req.body as never))
  )
};
