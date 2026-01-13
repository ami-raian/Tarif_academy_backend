import { Router } from "express";
import enrollmentController from "./enrollment.controller";
import { protectAdmin, protectStudent } from "../auth/auth.middleware";

const router = Router();

// Student routes
router.post("/", protectStudent, enrollmentController.createEnrollment);
router.get("/my-courses", protectStudent, enrollmentController.getMyEnrollments);
router.get("/check/:courseId", protectStudent, enrollmentController.checkEnrollment);
router.get("/progress/:courseId", protectStudent, enrollmentController.getCourseProgress);

// Admin routes
router.delete("/:enrollmentId", protectAdmin, enrollmentController.cancelEnrollment);

export default router;
