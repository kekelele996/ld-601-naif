import { Router } from "express";
import { facilityClosureController } from "../controllers/FacilityClosureController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", facilityClosureController.list);
router.get("/:id", facilityClosureController.detail);
router.get("/facility/:facilityId/active", facilityClosureController.activeByFacility);
// 封控/解除属于设施管理员与巡检员动作，RBAC 在路由层强制
router.post("/", rbacMiddleware(["admin", "facility_manager", "inspector"]), facilityClosureController.create);
router.post("/:id/release", rbacMiddleware(["admin", "facility_manager", "inspector"]), facilityClosureController.release);

export default router;
