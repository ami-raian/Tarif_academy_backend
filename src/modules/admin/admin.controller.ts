import { Request, Response } from "express";
import adminService from "./admin.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
  buildPagination,
} from "../../shared";

// @desc    Get all admins
// @route   GET /api/v1/admins
export const getAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await adminService.getAllAdmins();
    const pagination = buildPagination(admins.length, 1, admins.length || 10);

    paginatedResponse(res, admins, pagination, "Admins fetched successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Get single admin
// @route   GET /api/v1/admins/:id
export const getAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await adminService.getAdminById(req.params.id as string);

    if (!admin) {
      notFoundResponse(res, "Admin not found");
      return;
    }

    successResponse(res, admin, "Admin fetched successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Update admin
// @route   PUT /api/v1/admins/:id
export const updateAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const admin = await adminService.updateAdmin(
      req.params.id as string,
      req.body
    );

    if (!admin) {
      notFoundResponse(res, "Admin not found");
      return;
    }

    successResponse(res, admin, "Admin updated successfully");
  } catch (error) {
    errorResponse(
      res,
      error instanceof Error ? error.message : "Error updating admin",
      400
    );
  }
};

// @desc    Delete admin
// @route   DELETE /api/v1/admins/:id
export const deleteAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Prevent self-delete
    if (req.params.id === req.user?.id) {
      errorResponse(res, "You cannot delete yourself", 400);
      return;
    }

    const admin = await adminService.deleteAdmin(req.params.id as string);

    if (!admin) {
      notFoundResponse(res, "Admin not found");
      return;
    }

    successResponse(res, null, "Admin deleted successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Toggle admin status
// @route   PATCH /api/v1/admins/:id/toggle-status
export const toggleAdminStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Prevent self-deactivate
    if (req.params.id === req.user?.id) {
      errorResponse(res, "You cannot deactivate yourself", 400);
      return;
    }

    const admin = await adminService.toggleActiveStatus(
      req.params.id as string
    );

    if (!admin) {
      notFoundResponse(res, "Admin not found");
      return;
    }

    successResponse(
      res,
      admin,
      admin.isActive
        ? "Admin activated successfully"
        : "Admin deactivated successfully"
    );
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};
