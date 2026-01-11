import User from "./user.model";
import { IUser, ICreateUserInput, IUpdateUserInput } from "./user.interface";

class UserService {
  // Get all users
  async getAllUsers(): Promise<IUser[]> {
    return await User.find();
  }

  // Get user by ID
  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  // Create new user
  async createUser(userData: ICreateUserInput): Promise<IUser> {
    return await User.create(userData);
  }

  // Update user
  async updateUser(
    id: string,
    userData: IUpdateUserInput
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });
  }

  // Delete user
  async deleteUser(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id);
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    return !!user;
  }
}

export default new UserService();
