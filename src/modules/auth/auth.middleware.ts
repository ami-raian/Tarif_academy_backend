import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth.utils";
import { IJwtPayload } from "../admin/admin.interface";

// Extend Express Request to include user and multer file
declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      }
    }
  }
}

// Protect routes - Must be logged in
export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Access denied. No token provided.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid or expired token",
    });
    return;
  }

  req.user = decoded;
  next();
};

// Admin only middleware
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.type !== "admin") {
    res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Access denied. Admin only.",
    });
    return;
  }
  next();
};

// Student only middleware
export const studentOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.type !== "student") {
    res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Access denied. Student only.",
    });
    return;
  }
  next();
};

// Role-based access (for admin roles)
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
      return;
    }
    next();
  };
};

// Combined: protect + admin only
export const protectAdmin = [protect, adminOnly];

// Combined: protect + student only
export const protectStudent = [protect, studentOnly];
