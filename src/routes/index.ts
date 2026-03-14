import { Router } from "express";
import { userRoutes } from "../modules/user";
import { courseRoutes } from "../modules/course";
import { courseCategoryRoutes } from "../modules/course-category";
import { studentRoutes } from "../modules/student";
import { authRoutes } from "../modules/auth";
import { adminRoutes } from "../modules/admin";
import { videoRoutes } from "../modules/video";
import { enrollmentRoutes } from "../modules/enrollment";
import { webhookRoutes } from "../modules/webhook";
import { mcqRoutes } from "../modules/mcq";
import { studyLogRoutes } from "../modules/study-log";
import testBunnyRoutes from "./test-bunny";

const router: Router = Router();

// Auth routes (public + protected)
router.use("/auth", authRoutes);

// Admin routes (protected)
router.use("/admins", adminRoutes);

// Other module routes
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/course-categories", courseCategoryRoutes);
router.use("/students", studentRoutes);
router.use("/videos", videoRoutes);
router.use("/enrollments", enrollmentRoutes);

// Webhook routes (for external services like Bunny.net)
router.use("/webhooks", webhookRoutes);

// MCQ routes
router.use("/mcq", mcqRoutes);

// Study log routes
router.use("/study-logs", studyLogRoutes);

// Test routes (for debugging)
router.use("/", testBunnyRoutes);

// Future routes will be added here:
// router.use("/payments", paymentRoutes);

export default router;
