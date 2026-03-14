import { Router } from "express";
import { logStudy, getMyLogs, getAllLogs } from "./study-log.controller";
import { protectStudent, protectAdmin } from "../auth/auth.middleware";

const router: Router = Router();

// Student routes
router.post("/log", ...protectStudent, logStudy);
router.get("/my", ...protectStudent, getMyLogs);

// Admin routes
router.get("/", ...protectAdmin, getAllLogs);

export default router;
