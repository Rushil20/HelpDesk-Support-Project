import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { IJwtPayload } from "../types/auth.types";
import { ApiError } from "./ApiError";

export const signToken = (payload: IJwtPayload, expiresIn?: string): string => {
  const options: SignOptions = {
    expiresIn: (expiresIn || env.JWT_ACCESS_EXPIRES_IN) as unknown as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const verifyToken = (token: string): IJwtPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as IJwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized("Access token has expired");
    }
    console.log('error : ', error)
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized("Invalid access token");
    }
    throw ApiError.unauthorized("Authentication failed");
  }
};

