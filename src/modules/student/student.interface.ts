import { Document } from "mongoose";

// Guardian Types
export type GuardianType =
  | "father"
  | "mother"
  | "brother"
  | "sister"
  | "uncle"
  | "aunt"
  | "other";

// Board Names
export type BoardName =
  | "dhaka"
  | "rajshahi"
  | "chittagong"
  | "sylhet"
  | "barishal"
  | "khulna"
  | "dinajpur"
  | "comilla"
  | "jessore"
  | "mymensingh"
  | "technical"
  | "madrasah";

// Group Types
export type GroupType = "science" | "commerce" | "arts";

// Gender Types
export type GenderType = "male" | "female" | "other";

// Blood Groups
export type BloodGroupType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

// Guardian Interface
export interface IGuardian {
  type: GuardianType;
  name: string;
  mobile: string;
  occupation?: string;
  relation?: string; // If type is "other"
}

// Address Interface
export interface IAddress {
  present: string;
  district: string;
  permanent?: string;
}

// SSC Info Interface (Optional)
export interface ISSCInfo {
  roll?: string;
  registration?: string;
  schoolName?: string;
  board?: BoardName;
  passingYear?: number;
  group?: GroupType;
  gpa?: number;
}

// HSC Info Interface (Optional)
export interface IHSCInfo {
  roll?: string;
  registration?: string;
  collegeName?: string;
  board?: BoardName;
  passingYear?: number;
  group?: GroupType;
  gpa?: number;
}

// Educational Info Interface
export interface IEducationalInfo {
  ssc?: ISSCInfo;
  hsc?: IHSCInfo;
}

// Main Student Interface
export interface IStudent extends Document {
  // Unique Identifier
  roll: string;

  // Personal Info
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  whatsapp?: string;
  dateOfBirth: Date;
  gender: GenderType;
  bloodGroup?: BloodGroupType;
  photo?: string;
  nidOrBirthCert?: string;

  // Educational Info
  educationalInfo?: IEducationalInfo;

  // Guardian Info
  guardian?: IGuardian;

  // Address
  address?: IAddress;

  // Account Status
  isVerified: boolean;
  isActive: boolean;
  role: "student";

  // Soft Delete
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Create Student Input
export interface ICreateStudentInput {
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  whatsapp?: string;
  dateOfBirth: Date;
  gender: GenderType;
  bloodGroup?: BloodGroupType;
  photo?: string;
  nidOrBirthCert?: string;
  educationalInfo?: IEducationalInfo;
  guardian?: IGuardian;
  address?: IAddress;
}

// Update Student Input
export interface IUpdateStudentInput {
  roll?: string;
  fullName?: string;
  mobile?: string;
  whatsapp?: string;
  bloodGroup?: BloodGroupType;
  photo?: string;
  nidOrBirthCert?: string;
  educationalInfo?: Partial<IEducationalInfo>;
  guardian?: Partial<IGuardian>;
  address?: Partial<IAddress>;
}
