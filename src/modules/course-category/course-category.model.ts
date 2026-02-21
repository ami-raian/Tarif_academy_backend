import mongoose, { Schema } from "mongoose";
import { ICourseCategory } from "./course-category.interface";

const courseCategorySchema: Schema<ICourseCategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a category name"],
      trim: true,
      unique: true,
      maxlength: [100, "Category name cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Description cannot be more than 300 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

courseCategorySchema.pre("save", async function () {
  if (this.isModified("name")) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (
      await mongoose
        .model("CourseCategory")
        .findOne({ slug, _id: { $ne: this._id } })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

const CourseCategory = mongoose.model<ICourseCategory>(
  "CourseCategory",
  courseCategorySchema,
);

export default CourseCategory;
