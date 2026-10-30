import { Types } from "mongoose";
import { UserRole, UserStatus } from "../config/constants";

export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface IAuthenticatedUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}
