import jwt from "jsonwebtoken";
import { IJwtPayload } from "../admin/admin.interface";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// Generate Access Token
export const generateAccessToken = (payload: IJwtPayload): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

// Generate Refresh Token
export const generateRefreshToken = (payload: IJwtPayload): string => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

// Verify Token
export const verifyToken = (token: string): IJwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as IJwtPayload;
  } catch {
    return null;
  }
};

// Generate both tokens
export const generateTokens = (
  payload: IJwtPayload
): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
