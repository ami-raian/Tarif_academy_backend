import Joi from "joi";

// Common patterns
const bdMobilePattern = /^01[3-9]\d{8}$/;
const emailPattern = /^\S+@\S+\.\S+$/;

// Board enum values
const boardValues = [
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
const groupValues = ["science", "commerce", "arts"];

// Guardian type values
const guardianTypeValues = [
  "father",
  "mother",
  "brother",
  "sister",
  "uncle",
  "aunt",
  "other",
];

// Blood group values
const bloodGroupValues = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Gender values
const genderValues = ["male", "female", "other"];

// ============ SUB SCHEMAS ============

// SSC Schema (Optional)
const sscSchema = Joi.object({
  roll: Joi.string().trim().allow("", null),
  registration: Joi.string().trim().allow("", null),
  schoolName: Joi.string().trim().allow("", null),
  board: Joi.string()
    .valid(...boardValues)
    .allow("", null)
    .messages({
      "any.only": "Invalid board name",
    }),
  passingYear: Joi.number()
    .min(2000)
    .max(new Date().getFullYear() + 1)
    .allow(null)
    .messages({
      "number.min": "Passing year must be after 2000",
      "number.max": "Passing year cannot be in future",
    }),
  group: Joi.string()
    .valid(...groupValues)
    .allow("", null)
    .messages({
      "any.only": "Invalid group. Must be science, commerce, or arts",
    }),
  gpa: Joi.number().min(1).max(5).allow(null, 0, "").messages({
    "number.min": "GPA cannot be less than 1",
    "number.max": "GPA cannot be more than 5",
  }),
});

// HSC Schema (Optional)
const hscSchema = Joi.object({
  roll: Joi.string().trim().allow("", null),
  registration: Joi.string().trim().allow("", null),
  collegeName: Joi.string().trim().allow("", null),
  board: Joi.string()
    .valid(...boardValues)
    .allow("", null)
    .messages({
      "any.only": "Invalid board name",
    }),
  passingYear: Joi.number()
    .min(2000)
    .max(new Date().getFullYear() + 2)
    .allow(null)
    .messages({
      "number.min": "Passing year must be after 2000",
      "number.max": "Invalid passing year",
    }),
  group: Joi.string()
    .valid(...groupValues)
    .allow("", null)
    .messages({
      "any.only": "Invalid group",
    }),
  gpa: Joi.number().min(1).max(5).allow(null, 0, "").messages({
    "number.min": "GPA cannot be less than 1",
    "number.max": "GPA cannot be more than 5",
  }),
});

// Educational Info Schema
const educationalInfoSchema = Joi.object({
  ssc: sscSchema,
  hsc: hscSchema,
});

// Guardian Schema
const guardianSchema = Joi.object({
  type: Joi.string()
    .valid(...guardianTypeValues)
    .required()
    .messages({
      "any.only": "Invalid guardian type",
      "any.required": "Guardian type is required",
    }),
  name: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Guardian name is required",
    "string.min": "Guardian name must be at least 3 characters",
    "string.max": "Guardian name cannot exceed 100 characters",
    "any.required": "Guardian name is required",
  }),
  mobile: Joi.string().pattern(bdMobilePattern).required().messages({
    "string.pattern.base":
      "Please enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
    "any.required": "Guardian mobile is required",
  }),
  occupation: Joi.string().trim().allow(""),
  relation: Joi.string().trim().allow(""),
});

// Address Schema
const addressSchema = Joi.object({
  present: Joi.string().trim().required().messages({
    "string.empty": "Present address is required",
    "any.required": "Present address is required",
  }),
  district: Joi.string().trim().required().messages({
    "string.empty": "District is required",
    "any.required": "District is required",
  }),
  permanent: Joi.string().trim().allow(""),
});

// ============ MAIN SCHEMAS ============

// Register Student Schema
export const registerStudentSchema = Joi.object({
  // Personal Info
  fullName: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Full name is required",
  }),

  email: Joi.string().pattern(emailPattern).lowercase().required().messages({
    "string.pattern.base": "Please enter a valid email",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),

  mobile: Joi.string().pattern(bdMobilePattern).required().messages({
    "string.pattern.base":
      "Please enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
    "any.required": "Mobile number is required",
  }),

  whatsapp: Joi.string().pattern(bdMobilePattern).allow("").messages({
    "string.pattern.base": "Please enter a valid WhatsApp number (01XXXXXXXXX)",
  }),

  dateOfBirth: Joi.date().max("now").required().messages({
    "date.max": "Date of birth cannot be in the future",
    "any.required": "Date of birth is required",
  }),

  gender: Joi.string()
    .valid(...genderValues)
    .required()
    .messages({
      "any.only": "Invalid gender",
      "any.required": "Gender is required",
    }),

  bloodGroup: Joi.string()
    .valid(...bloodGroupValues)
    .messages({
      "any.only": "Invalid blood group",
    }),

  photo: Joi.string().allow(""),

  nidOrBirthCert: Joi.string().trim().allow(""),

  // Educational Info (Optional)
  educationalInfo: educationalInfoSchema,

  // Guardian (Optional)
  guardian: guardianSchema,

  // Address (Optional)
  address: addressSchema,
});

// Update Student Schema (all optional)
export const updateStudentSchema = Joi.object({
  roll: Joi.number().integer().positive().messages({
    "number.base": "Roll must be a number",
    "number.integer": "Roll must be an integer",
    "number.positive": "Roll must be a positive number",
  }),

  fullName: Joi.string().trim().min(3).max(100).messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),

  mobile: Joi.string().pattern(bdMobilePattern).messages({
    "string.pattern.base": "Please enter a valid Bangladeshi mobile number",
  }),

  whatsapp: Joi.string().pattern(bdMobilePattern).allow("").messages({
    "string.pattern.base": "Please enter a valid WhatsApp number",
  }),

  bloodGroup: Joi.string()
    .valid(...bloodGroupValues)
    .messages({
      "any.only": "Invalid blood group",
    }),

  photo: Joi.string().allow(""),

  nidOrBirthCert: Joi.string().trim().allow(""),

  educationalInfo: Joi.object({
    ssc: Joi.object({
      roll: Joi.string().trim(),
      registration: Joi.string().trim(),
      schoolName: Joi.string().trim(),
      board: Joi.string().valid(...boardValues),
      passingYear: Joi.number().min(2000).max(new Date().getFullYear()),
      group: Joi.string().valid(...groupValues),
      gpa: Joi.number().min(1).max(5),
    }),
    hsc: hscSchema,
  }),

  guardian: Joi.object({
    type: Joi.string().valid(...guardianTypeValues),
    name: Joi.string().trim().min(3).max(100),
    mobile: Joi.string().pattern(bdMobilePattern),
    occupation: Joi.string().trim().allow(""),
    relation: Joi.string().trim().allow(""),
  }),

  address: Joi.object({
    present: Joi.string().trim(),
    district: Joi.string().trim(),
    permanent: Joi.string().trim().allow(""),
  }),
});

// ID Parameter Schema
export const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid ID format",
      "any.required": "ID is required",
    }),
});
