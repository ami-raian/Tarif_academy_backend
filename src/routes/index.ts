import { Router } from "express";
import { userRoutes } from "../modules/user";
import { courseRoutes } from "../modules/course";
import { studentRoutes } from "../modules/student";
import { authRoutes } from "../modules/auth";
import { adminRoutes } from "../modules/admin";
import { videoRoutes } from "../modules/video";
import { enrollmentRoutes } from "../modules/enrollment";

const router: Router = Router();

// Auth routes (public + protected)
router.use("/auth", authRoutes);

// Admin routes (protected)
router.use("/admins", adminRoutes);

// Other module routes
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/students", studentRoutes);
router.use("/videos", videoRoutes);
router.use("/enrollments", enrollmentRoutes);

// Future routes will be added here:
// router.use("/payments", paymentRoutes);

export default router;
