import Admin from "./admin.model";
import { IAdmin, ICreateAdminInput } from "./admin.interface";

class AdminService {
  // Get all admins
  async getAllAdmins(): Promise<IAdmin[]> {
    return await Admin.find().select("-password");
  }

  // Get admin by ID
  async getAdminById(id: string): Promise<IAdmin | null> {
    return await Admin.findById(id).select("-password");
  }

  // Get admin by email (with password for auth)
  async getAdminByEmail(email: string): Promise<IAdmin | null> {
    return await Admin.findOne({ email }).select("+password");
  }

  // Create admin
  async createAdmin(adminData: ICreateAdminInput): Promise<IAdmin> {
    return await Admin.create(adminData);
  }

  // Update admin
  async updateAdmin(
    id: string,
    adminData: Partial<ICreateAdminInput>
  ): Promise<IAdmin | null> {
    return await Admin.findByIdAndUpdate(id, adminData, {
      new: true,
      runValidators: true,
    }).select("-password");
  }

  // Delete admin
  async deleteAdmin(id: string): Promise<IAdmin | null> {
    return await Admin.findByIdAndDelete(id);
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const admin = await Admin.findOne({ email });
    return !!admin;
  }

  // Update last login
  async updateLastLogin(id: string): Promise<void> {
    await Admin.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  // Toggle active status
  async toggleActiveStatus(id: string): Promise<IAdmin | null> {
    const admin = await Admin.findById(id);
    if (!admin) return null;

    admin.isActive = !admin.isActive;
    await admin.save();
    return admin;
  }
}

export default new AdminService();
