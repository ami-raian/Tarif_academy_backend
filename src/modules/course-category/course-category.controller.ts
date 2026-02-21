import { Request, Response } from "express";
import courseCategoryService from "./course-category.service";

export const getCourseCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { page, limit, search, isActive } = req.query;

    const result = await courseCategoryService.getAllCategories({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
    });

    const pageSize = limit ? parseInt(limit as string, 10) : 20;

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Course categories fetched successfully",
      data: result.categories,
      pagination: {
        totalItems: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        pageSize,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch course categories",
    });
  }
};

export const getCourseCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const category = await courseCategoryService.getCategoryById(
      req.params.id as string,
    );

    if (!category) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Course category fetched successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch course category",
    });
  }
};

export const createCourseCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const category = await courseCategoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Course category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create course category",
    });
  }
};

export const updateCourseCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const category = await courseCategoryService.updateCategory(
      req.params.id as string,
      req.body,
    );

    if (!category) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Course category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update course category",
    });
  }
};

export const deleteCourseCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const category = await courseCategoryService.deleteCategory(
      req.params.id as string,
    );

    if (!category) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Course category deleted successfully",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete course category",
    });
  }
};
