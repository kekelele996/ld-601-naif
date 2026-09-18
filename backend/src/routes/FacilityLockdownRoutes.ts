import { Router } from "express";
import { facilityLockdownController } from "../controllers/FacilityLockdownController";

const router = Router();

router.get("/", facilityLockdownController.list);
router.post("/facility/:facilityId/lockdown", facilityLockdownController.lockdown);
router.post("/facility/:facilityId/release", facilityLockdownController.release);
router.get("/facility/:facilityId/status", facilityLockdownController.status);

export default router;
