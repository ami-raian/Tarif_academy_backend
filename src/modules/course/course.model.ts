import mongoose, { Schema } from "mongoose";
import { ICourse } from "./course.interface";

const courseSchema: Schema<ICourse> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a course title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },
    thumbnail: {
      type: String,
      default: "default-course.jpg",
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: [true, "Please add an instructor"],
      optional: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "CourseCategory",
      index: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    language: {
      type: String,
      default: "Bangla",
    },
    duration: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  },
);

// Generate slug from title before saving
courseSchema.pre("save", async function () {
  if (this.isModified("title")) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    let slug = baseSlug;
    let counter = 1;

    // Check for uniqueness
    while (
      await mongoose.model("Course").findOne({ slug, _id: { $ne: this._id } })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

const Course = mongoose.model<ICourse>("Course", courseSchema);

export default Course;
