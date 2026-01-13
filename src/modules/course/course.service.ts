import Course from "./course.model";
import {
  ICourse,
  ICreateCourseInput,
  IUpdateCourseInput,
} from "./course.interface";

interface QueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  isPublished?: boolean;
  search?: string;
}

class CourseService {
  // Get all courses with filters
  async getAllCourses(options: QueryOptions = {}): Promise<{
    courses: ICourse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      isPublished,
      search,
    } = options;

    const query: Record<string, unknown> = {};

    // Only filter by isPublished if explicitly set
    if (isPublished !== undefined) {
      query.isPublished = isPublished;
    }

    // Exclude soft-deleted courses
    query.isDeleted = false;

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructor", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Course.countDocuments(query),
    ]);

    return {
      courses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get course by ID
  async getCourseById(id: string): Promise<ICourse | null> {
    return await Course.findOne({ _id: id, isDeleted: false }).populate(
      "instructor",
      "name email"
    );
  }

  // Get course by slug
  async getCourseBySlug(slug: string): Promise<ICourse | null> {
    return await Course.findOne({ slug, isDeleted: false }).populate(
      "instructor",
      "name email"
    );
  }

  // Create new course
  async createCourse(courseData: ICreateCourseInput): Promise<ICourse> {
    return await Course.create(courseData);
  }

  // Update course
  async updateCourse(
    id: string,
    courseData: IUpdateCourseInput
  ): Promise<ICourse | null> {
    // Only update if not soft-deleted
    return await Course.findOneAndUpdate(
      { _id: id, isDeleted: false },
      courseData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  // Soft delete course (record who deleted)
  async deleteCourse(id: string, deletedBy?: string): Promise<ICourse | null> {
    return await Course.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  // Publish/Unpublish course
  async togglePublish(id: string): Promise<ICourse | null> {
    const course = await Course.findOne({ _id: id, isDeleted: false });
    if (!course) return null;

    course.isPublished = !course.isPublished;
    await course.save();
    return course;
  }

  // Get courses by instructor
  async getCoursesByInstructor(instructorId: string): Promise<ICourse[]> {
    return await Course.find({
      instructor: instructorId,
      isDeleted: false,
    }).sort({
      createdAt: -1,
    });
  }

  // Increment enrolled students
  async incrementEnrollment(id: string): Promise<ICourse | null> {
    return await Course.findByIdAndUpdate(
      id,
      { $inc: { enrolledStudents: 1 } },
      { new: true }
    );
  }
}

export default new CourseService();
