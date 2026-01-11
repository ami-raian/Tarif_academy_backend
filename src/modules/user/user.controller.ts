import { Request, Response } from "express";
import userService from "./user.service";
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse,
  buildPagination,
} from "../../shared";

// @desc    Get all users
// @route   GET /api/users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const users = await userService.getAllUsers();
    const pagination = buildPagination(users.length, page, limit);

    paginatedResponse(res, users, pagination, "Users fetched successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params.id as string);

    if (!user) {
      notFoundResponse(res, "User not found");
      return;
    }

    successResponse(res, user, "User fetched successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Create a user
// @route   POST /api/users
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const emailExists = await userService.emailExists(email);
    if (emailExists) {
      errorResponse(res, "Email already exists", 400);
      return;
    }

    const user = await userService.createUser({ name, email, password });

    createdResponse(res, user, "User created successfully");
  } catch (error) {
    errorResponse(
      res,
      error instanceof Error ? error.message : "Error creating user",
      400
    );
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await userService.updateUser(
      req.params.id as string,
      req.body
    );

    if (!user) {
      notFoundResponse(res, "User not found");
      return;
    }

    successResponse(res, user, "User updated successfully");
  } catch (error) {
    errorResponse(
      res,
      error instanceof Error ? error.message : "Error updating user",
      400
    );
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await userService.deleteUser(req.params.id as string);

    if (!user) {
      notFoundResponse(res, "User not found");
      return;
    }

    successResponse(res, null, "User deleted successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};
