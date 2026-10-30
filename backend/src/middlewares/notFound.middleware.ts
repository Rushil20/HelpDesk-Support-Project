import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Page not found`));
};
