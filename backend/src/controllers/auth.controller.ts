import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await AuthService.register(req.body);
    ApiResponse.created(res, "User registered successfully", user);
  });

  static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await AuthService.login(req.body);
    ApiResponse.success(res, "Login successful", result);
  });

  static getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await AuthService.getCurrentUser(req.user!._id.toString());
    ApiResponse.success(res, "Current user retrieved successfully", user);
  });
}

