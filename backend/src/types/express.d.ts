import { IAuthenticatedUser } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthenticatedUser;
    }
  }
}

export {};

