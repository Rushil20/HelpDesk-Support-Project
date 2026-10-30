import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Safely assign parsed/coerced values back to request
      if (parsed && typeof parsed === "object") {
        const p = parsed as { body?: unknown; query?: unknown; params?: unknown };
        if (p.body !== undefined) {
          req.body = p.body;
        }
        if (p.query !== undefined) {
          Object.defineProperty(req, "query", {
            value: p.query,
            writable: true,
            configurable: true,
          });
        }
        if (p.params !== undefined) {
          Object.defineProperty(req, "params", {
            value: p.params,
            writable: true,
            configurable: true,
          });
        }
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join(".").replace(/^(body|query|params)\.?/, ""),
          location: err.path[0],
          message: err.message,
        }));
        next(ApiError.badRequest("Validation failed", formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
