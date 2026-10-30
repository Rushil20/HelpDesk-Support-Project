import { Schema, model, Document, Types } from "mongoose";
import { UserRole, UserStatus, USER_ROLES, USER_STATUSES } from "../config/constants";
import { hashPassword } from "../utils/password";

export interface IUser {
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document<Types.ObjectId> {
  _id: Types.ObjectId;
  toSanitized(): Omit<IUser, "password"> & { _id: Types.ObjectId };
}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: UserRole.EMPLOYEE,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: UserStatus.ACTIVE,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  // Avoid re-hashing if already an Argon2 hash
  if (this.password.startsWith("$argon2id$") || this.password.startsWith("$argon2i$")) {
    return;
  }
  this.password = await hashPassword(this.password);
});

userSchema.methods.toSanitized = function (): Omit<IUser, "password"> & { _id: Types.ObjectId } {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

export const User = model<IUserDocument>("User", userSchema, "users");
