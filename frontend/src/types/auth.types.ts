export enum UserRole {
  EMPLOYEE = "employee",
  AGENT = "agent",
  ADMIN = "admin",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
}

