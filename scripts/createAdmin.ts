import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Admin schema (simplified version)
const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "super_admin" },
  isActive: { type: Boolean, default: true },
  type: { type: String, default: "admin" },
});

const Admin = mongoose.model("Admin", adminSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/tarifacademy";
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Admin details
    const adminData = {
      fullName: "Super Admin",
      email: "super_admin@tarifacademy.com",
      password: "@super_admin123456", // Change this!
      role: "super_admin",
      isActive: true,
      type: "admin",
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("⚠️  Admin already exists with this email!");
      console.log("📧 Email:", adminData.email);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin
    const admin = await Admin.create({
      ...adminData,
      password: hashedPassword,
    });

    console.log("\n🎉 Admin created successfully!\n");
    console.log("📧 Email:", adminData.email);
    console.log("🔑 Password:", adminData.password);
    console.log("👤 Role:", adminData.role);
    console.log("🆔 ID:", admin._id);
    console.log("\n⚠️  IMPORTANT: Change the password after first login!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
