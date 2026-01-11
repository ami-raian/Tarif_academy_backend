import { Router } from "express";
import {
  adminLogin,
  adminRegister,
  getAdminProfile,
  studentLogin,
  getStudentProfile,
  refreshToken,
  changePassword,
} from "./auth.controller";
import {
  protect,
  protectAdmin,
  protectStudent,
  authorize,
} from "./auth.middleware";

const router: Router = Router();

// ============ ADMIN AUTH ROUTES ============
// POST /api/v1/auth/admin/login
router.post("/admin/login", adminLogin);

// POST /api/v1/auth/admin/register (Protected - super_admin only)
router.post(
  "/admin/register",
  protect,
  authorize("super_admin"),
  adminRegister
);

// GET /api/v1/auth/admin/me (Protected - admin only)
router.get("/admin/me", protectAdmin, getAdminProfile);

// ============ STUDENT AUTH ROUTES ============
// POST /api/v1/auth/student/login
router.post("/student/login", studentLogin);

// Note: Student registration is at /api/v1/students/register

// GET /api/v1/auth/student/me (Protected - student only)
router.get("/student/me", protectStudent, getStudentProfile);

// ============ COMMON AUTH ROUTES ============
// POST /api/v1/auth/refresh-token
router.post("/refresh-token", refreshToken);

// POST /api/v1/auth/change-password (Protected - both)
router.post("/change-password", protect, changePassword);

export default router;
