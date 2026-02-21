import Course from "../course/course.model";
import CourseCategory from "./course-category.model";
import {
  ICourseCategory,
  ICourseCategoryQueryOptions,
  ICreateCourseCategoryInput,
  IUpdateCourseCategoryInput,
} from "./course-category.interface";

class CourseCategoryService {
  async getAllCategories(options: ICourseCategoryQueryOptions = {}): Promise<{
    categories: ICourseCategory[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, isActive } = options;

    const query: Record<string, unknown> = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      CourseCategory.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      CourseCategory.countDocuments(query),
    ]);

    return {
      categories: categories as ICourseCategory[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCategoryById(id: string): Promise<ICourseCategory | null> {
    return await CourseCategory.findById(id);
  }

  async createCategory(
    payload: ICreateCourseCategoryInput,
  ): Promise<ICourseCategory> {
    const existingCategory = await CourseCategory.findOne({
      name: { $regex: `^${payload.name.trim()}$`, $options: "i" },
    });

    if (existingCategory) {
      throw new Error("Category name already exists");
    }

    return await CourseCategory.create({
      ...payload,
      name: payload.name.trim(),
      description: payload.description?.trim() || "",
    });
  }

  async updateCategory(
    id: string,
    payload: IUpdateCourseCategoryInput,
  ): Promise<ICourseCategory | null> {
    const existingCategory = await CourseCategory.findById(id);
    if (!existingCategory) {
      return null;
    }

    if (
      payload.name &&
      payload.name.trim().toLowerCase() !== existingCategory.name.toLowerCase()
    ) {
      const duplicate = await CourseCategory.findOne({
        _id: { $ne: id },
        name: { $regex: `^${payload.name.trim()}$`, $options: "i" },
      });

      if (duplicate) {
        throw new Error("Category name already exists");
      }
    }

    const updatedCategory = await CourseCategory.findByIdAndUpdate(
      id,
      {
        ...payload,
        ...(payload.name ? { name: payload.name.trim() } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description.trim() }
          : {}),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedCategory) {
      return null;
    }

    if (payload.name && payload.name.trim() !== existingCategory.name) {
      await Course.updateMany(
        { categoryId: updatedCategory._id },
        { category: updatedCategory.name },
      );
    }

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<ICourseCategory | null> {
    const courseCount = await Course.countDocuments({
      categoryId: id,
      isDeleted: false,
    });

    if (courseCount > 0) {
      throw new Error("This category is used by existing courses");
    }

    return await CourseCategory.findByIdAndDelete(id);
  }
}

export default new CourseCategoryService();
