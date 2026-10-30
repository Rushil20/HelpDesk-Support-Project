import { Response } from "express";

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data?: T;

  constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }

  static send<T>(res: Response, statusCode: number, message: string, data?: T): Response {
    return res.status(statusCode).json(new ApiResponse(true, message, data));
  }

  static success<T>(res: Response, message: string, data?: T): Response {
    return ApiResponse.send(res, 200, message, data);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return ApiResponse.send(res, 201, message, data);
  }
}

