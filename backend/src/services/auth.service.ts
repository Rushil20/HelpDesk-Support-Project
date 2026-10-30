import { User } from "../models/user.model";
import { UserRole, UserStatus } from "../config/constants";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { ApiError } from "../utils/ApiError";
import { verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { sanitizeUser, SanitizedUser } from "../helpers/auth.helper";

export class AuthService {
  static async register(input: RegisterInput): Promise<SanitizedUser> {
    const existingUser = await User.findOne({
      $or: [{ email: input.email.toLowerCase() }, { username: input.username }],
    });

    if (existingUser) {
      if (existingUser.email === input.email.toLowerCase()) {
        throw ApiError.conflict("An account with this email already exists");
      }
      throw ApiError.conflict("Username is already taken");
    }

    // Every registered user automatically receives the Employee role
    const newUser = await User.create({
      username: input.username,
      email: input.email.toLowerCase(),
      password: input.password,
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
    });

    return sanitizeUser(newUser);
  }

  static async login(
    input: LoginInput
  ): Promise<{ user: SanitizedUser; accessToken: string }> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select("+password");

    if (!user || !user.password) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await verifyPassword(input.password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw ApiError.unauthorized("Your account is inactive. Please contact an administrator");
    }

    const accessToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      accessToken,
    };
  }

  static async getCurrentUser(userId: string): Promise<SanitizedUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw ApiError.unauthorized("Your account is inactive");
    }

    return sanitizeUser(user);
  }
}

