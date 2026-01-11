import { Response } from "express";

// Pagination interface
export interface IPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface ApiResponseOptions {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: unknown;
  pagination?: IPagination;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  options: Omit<ApiResponseOptions, "statusCode">
): Response => {
  return res.status(statusCode).json({
    ...options,
    statusCode,
  });
};

// Success response
export const successResponse = (
  res: Response,
  data: unknown,
  message = "Success",
  statusCode = 200
): Response => {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
  });
};

// Success response with pagination
export const paginatedResponse = (
  res: Response,
  data: unknown,
  pagination: IPagination,
  message = "Data fetched successfully",
  statusCode = 200
): Response => {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
    pagination,
  });
};

// Error response
export const errorResponse = (
  res: Response,
  message = "Error",
  statusCode = 500
): Response => {
  return sendResponse(res, statusCode, {
    success: false,
    message,
  });
};

// Created response
export const createdResponse = (
  res: Response,
  data: unknown,
  message = "Created successfully"
): Response => {
  return successResponse(res, data, message, 201);
};

// Not found response
export const notFoundResponse = (
  res: Response,
  message = "Resource not found"
): Response => {
  return errorResponse(res, message, 404);
};

// Helper to build pagination object
export const buildPagination = (
  totalItems: number,
  currentPage: number,
  pageSize: number
): IPagination => {
  return {
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    currentPage,
    pageSize,
  };
};
