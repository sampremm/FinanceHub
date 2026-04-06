import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    sendError(
      res,
      "Validation failed",
      422,
      err.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
    );
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma unique constraint
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code: string };
    if (prismaErr.code === "P2002") {
      sendError(res, "A record with this value already exists", 409);
      return;
    }
    if (prismaErr.code === "P2025") {
      sendError(res, "Record not found", 404);
      return;
    }
  }

  console.error("Unhandled error:", err);
  sendError(res, "Internal server error", 500);
};

export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
