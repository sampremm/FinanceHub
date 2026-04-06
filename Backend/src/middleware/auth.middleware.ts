import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { sendError } from "../utils/response";
import type { Role } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}


export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Authorization token required", 401);
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret) as { id: string };

    const user = await prisma.user.findFirst({
      where: { id: decoded.id, deletedAt: null },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (!user) {
      sendError(res, "User not found", 401);
      return;
    }

    if (user.status === "INACTIVE") {
      sendError(res, "Account is inactive", 403);
      return;
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch {
    sendError(res, "Invalid or expired token", 401);
  }
};
