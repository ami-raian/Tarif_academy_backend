import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IStudent } from "./student.interface";

// Guardian Sub-Schema
const guardianSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["father", "mother", "brother", "sister", "uncle", "aunt", "other"],
      required: [true, "Guardian type is required"],
    },
    name: {
      type: String,
      required: [true, "Guardian name is required"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Guardian mobile is required"],
      match: [
        /^01[3-9]\d{8}$/,
        "Please enter a valid Bangladeshi mobile number",
      ],
    },
    occupation: {
      type: String,
      trim: true,
    },
    relation: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

// Address Sub-Schema
const addressSchema = new Schema(
  {
    present: {
      type: String,
      required: [true, "Present address is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    permanent: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

// Board enum values
const boardEnumValues = [
  "dhaka",
  "rajshahi",
  "chittagong",
  "sylhet",
  "barishal",
  "khulna",
  "dinajpur",
  "comilla",
  "jessore",
  "mymensingh",
  "technical",
  "madrasah",
];

// Group enum values
const groupEnumValues = ["science", "commerce", "arts"];

// SSC Info Sub-Schema (Required)
const sscInfoSchema = new Schema(
  {
    roll: {
      type: String,
      required: [true, "SSC Roll is required"],
      trim: true,
    },
    registration: {
      type: String,
      required: [true, "SSC Registration is required"],
      trim: true,
    },
    schoolName: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
    },
    board: {
      type: String,
      enum: boardEnumValues,
      required: [true, "SSC Board is required"],
    },
    passingYear: {
      type: Number,
      required: [true, "SSC Passing year is required"],
      min: [2000, "Passing year must be after 2000"],
      max: [new Date().getFullYear(), "Passing year cannot be in future"],
    },
    group: {
      type: String,
      enum: groupEnumValues,
      required: [true, "SSC Group is required"],
    },
    gpa: {
      type: Number,
      min: [1, "GPA cannot be less than 1"],
      max: [5, "GPA cannot be more than 5"],
    },
  },
  { _id: false },
);

// HSC Info Sub-Schema (Optional)
const hscInfoSchema = new Schema(
  {
    roll: {
      type: String,
      trim: true,
    },
    registration: {
      type: String,
      trim: true,
    },
    collegeName: {
      type: String,
      trim: true,
    },
    board: {
      type: String,
      enum: boardEnumValues,
    },
    passingYear: {
      type: Number,
      validate: {
        validator: function (value: number) {
          if (!value && value !== 0) return true; // Allow null/undefined
          return value >= 2000 && value <= new Date().getFullYear() + 2;
        },
        message: "Passing year must be between 2000 and current year + 2",
      },
    },
    group: {
      type: String,
      enum: {
        values: groupEnumValues,
        message: "Invalid group",
      },
    },
    gpa: {
      type: Number,
      validate: {
        validator: function (value: number) {
          // Allow null, undefined, or 0 (empty/not provided)
          if (value === null || value === undefined || value === 0) return true;
          return value >= 1 && value <= 5;
        },
        message: "GPA must be between 1 and 5",
      },
    },
  },
  { _id: false },
);

// Educational Info Sub-Schema
const educationalInfoSchema = new Schema(
  {
    ssc: {
      type: sscInfoSchema,
      required: [true, "SSC information is required"],
    },
    hsc: {
      type: hscInfoSchema,
    },
  },
  { _id: false },
);

// Main Student Schema
const studentSchema: Schema<IStudent> = new Schema(
  {
    // Unique Identifier
    roll: {
      type: Number,
      unique: true,
    },

    // Personal Info
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      match: [
        /^01[3-9]\d{8}$/,
        "Please enter a valid Bangladeshi mobile number",
      ],
    },
    whatsapp: {
      type: String,
      match: [/^01[3-9]\d{8}$/, "Please enter a valid WhatsApp number"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    photo: {
      type: String,
      default: "default-avatar.jpg",
    },
    nidOrBirthCert: {
      type: String,
      trim: true,
    },

    // Educational Info
    educationalInfo: {
      type: educationalInfoSchema,
      required: [true, "Educational information is required"],
    },

    // Guardian Info (Optional)
    guardian: {
      type: guardianSchema,
    },

    // Address (Optional)
    address: {
      type: addressSchema,
    },

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "student",
      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
studentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Index for faster queries
studentSchema.index({
  "educationalInfo.ssc.roll": 1,
  "educationalInfo.ssc.board": 1,
});

const Student = mongoose.model<IStudent>("Student", studentSchema);

export default Student;
