import { Router } from "express";
import { assistanceRequestController } from "../controllers/AssistanceRequestController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", assistanceRequestController.list);
router.post("/", assistanceRequestController.create);
// 重新派单为志愿者/调度动作
router.post("/:id/dispatch", rbacMiddleware(["admin", "volunteer", "dispatcher"]), assistanceRequestController.dispatch);
export default router;
