import { Router } from "express";
import {
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
} from "./admin.controller";
import { protectAdmin, authorize } from "../auth/auth.middleware";

const router: Router = Router();

// All admin routes are protected
router.use(protectAdmin);

// GET /api/v1/admins - Get all admins (admin/super_admin only)
router.get("/", authorize("super_admin", "admin"), getAdmins);

// GET /api/v1/admins/:id - Get single admin
router.get("/:id", getAdmin);

// PUT /api/v1/admins/:id - Update admin (super_admin only)
router.put("/:id", authorize("super_admin"), updateAdmin);

// DELETE /api/v1/admins/:id - Delete admin (super_admin only)
router.delete("/:id", authorize("super_admin"), deleteAdmin);

// PATCH /api/v1/admins/:id/toggle-status - Toggle status (super_admin only)
router.patch("/:id/toggle-status", authorize("super_admin"), toggleAdminStatus);

export default router;
