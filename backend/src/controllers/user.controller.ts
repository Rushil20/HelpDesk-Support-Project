import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ListUsersQuery } from "../validators/user.validator";

export class UserController {
  static createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await UserService.createUser(req.body);
    ApiResponse.created(res, "User created successfully", user);
  });

  static listUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListUsersQuery;
    const result = await UserService.listUsers(query);
    ApiResponse.success(res, "Users retrieved successfully", result);
  });

  static getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await UserService.getUserById(req.params.id as string);
    ApiResponse.success(res, "User details retrieved successfully", user);
  });

  static updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await UserService.updateUser(req.params.id as string, req.body);
    ApiResponse.success(res, "User updated successfully", user);
  });

  static deactivateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await UserService.deactivateUser(req.params.id as string, req.user!._id);
    ApiResponse.success(res, "User deactivated successfully", user);
  });

  static changeUserRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await UserService.changeUserRole(
      req.params.id as string,
      req.body,
      req.user!._id
    );
    ApiResponse.success(res, "User role updated successfully", user);
  });
}

