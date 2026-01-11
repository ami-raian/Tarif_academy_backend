import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import adminService from "../admin/admin.service";
import studentService from "../student/student.service";
import { generateTokens } from "./auth.utils";
import { successResponse, errorResponse, createdResponse } from "../../shared";

// ============ ADMIN AUTH ============

// @desc    Admin Login
// @route   POST /api/v1/auth/admin/login
export const adminLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      errorResponse(res, "Please provide email and password", 400);
      return;
    }

    // Check if admin exists
    const admin = await adminService.getAdminByEmail(email);
    if (!admin) {
      errorResponse(res, "Invalid email or password", 401);
      return;
    }

    // Check if admin is active
    if (!admin.isActive) {
      errorResponse(res, "Your account has been deactivated", 401);
      return;
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      errorResponse(res, "Invalid email or password", 401);
      return;
    }

    // Update last login
    await adminService.updateLastLogin(String(admin._id));

    // Generate tokens
    const tokens = generateTokens({
      id: String(admin._id),
      email: admin.email,
      role: admin.role,
      type: "admin",
    });

    successResponse(
      res,
      {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
        },
        ...tokens,
      },
      "Admin logged in successfully"
    );
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Admin Register (Protected - Only super_admin can create)
// @route   POST /api/v1/auth/admin/register
export const adminRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if email exists
    const emailExists = await adminService.emailExists(email);
    if (emailExists) {
      errorResponse(res, "Email already registered", 400);
      return;
    }

    // Create admin
    const admin = await adminService.createAdmin({
      name,
      email,
      password,
      role: role || "admin",
      phone,
    });

    createdResponse(
      res,
      {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      "Admin created successfully"
    );
  } catch (error) {
    errorResponse(
      res,
      error instanceof Error ? error.message : "Error creating admin",
      400
    );
  }
};

// @desc    Get Admin Profile
// @route   GET /api/v1/auth/admin/me
export const getAdminProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const admin = await adminService.getAdminById(req.user!.id);

    if (!admin) {
      errorResponse(res, "Admin not found", 404);
      return;
    }

    successResponse(res, admin, "Admin profile fetched successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// ============ STUDENT AUTH ============

// @desc    Student Login
// @route   POST /api/v1/auth/student/login
export const studentLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      errorResponse(res, "Please provide email and password", 400);
      return;
    }

    // Check if student exists (with password)
    const student = await studentService.getStudentByEmailWithPassword(email);
    if (!student) {
      errorResponse(res, "Invalid email or password", 401);
      return;
    }

    // Check if student is active
    if (!student.isActive) {
      errorResponse(res, "Your account has been deactivated", 401);
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      errorResponse(res, "Invalid email or password", 401);
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      id: String(student._id),
      email: student.email,
      role: "student",
      type: "student",
    });

    successResponse(
      res,
      {
        student: {
          id: student._id,
          fullName: student.fullName,
          email: student.email,
          mobile: student.mobile,
          photo: student.photo,
          isVerified: student.isVerified,
        },
        ...tokens,
      },
      "Student logged in successfully"
    );
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Get Student Profile
// @route   GET /api/v1/auth/student/me
export const getStudentProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const student = await studentService.getStudentById(req.user!.id);

    if (!student) {
      errorResponse(res, "Student not found", 404);
      return;
    }

    successResponse(res, student, "Student profile fetched successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// ============ COMMON ============

// @desc    Refresh Token
// @route   POST /api/v1/auth/refresh-token
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      errorResponse(res, "Refresh token is required", 400);
      return;
    }

    // Verify refresh token
    const { verifyToken } = await import("./auth.utils");
    const decoded = verifyToken(refreshToken);

    if (!decoded) {
      errorResponse(res, "Invalid or expired refresh token", 401);
      return;
    }

    // Generate new tokens
    const tokens = generateTokens({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
    });

    successResponse(res, tokens, "Token refreshed successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Change Password (for both admin and student)
// @route   POST /api/v1/auth/change-password
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id, type } = req.user!;

    if (!currentPassword || !newPassword) {
      errorResponse(res, "Please provide current and new password", 400);
      return;
    }

    if (newPassword.length < 6) {
      errorResponse(res, "New password must be at least 6 characters", 400);
      return;
    }

    if (type === "admin") {
      const admin = await adminService.getAdminByEmail(req.user!.email);
      if (!admin) {
        errorResponse(res, "User not found", 404);
        return;
      }

      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        errorResponse(res, "Current password is incorrect", 401);
        return;
      }

      // Update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await adminService.updateAdmin(id, { password: hashedPassword } as any);
    } else {
      const student = await studentService.getStudentByEmailWithPassword(
        req.user!.email
      );
      if (!student) {
        errorResponse(res, "User not found", 404);
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, student.password);
      if (!isMatch) {
        errorResponse(res, "Current password is incorrect", 401);
        return;
      }

      // Update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await studentService.updateStudentPassword(id, hashedPassword);
    }

    successResponse(res, null, "Password changed successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};
