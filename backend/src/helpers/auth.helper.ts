import { IUserDocument } from "../models/user.model";
import { UserRole, UserStatus } from "../config/constants";
import { Types } from "mongoose";

export interface SanitizedUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

export const sanitizeUser = (user: IUserDocument | SanitizedUser): SanitizedUser => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
};

