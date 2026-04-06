import type { Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import type { AuthRequest } from "./auth.middleware";
import { sendError } from "../utils/response";

// Higher number = more access
const ROLE_HIERARCHY: Record<Role, number> = {
  VIEWER: 1,
  ANALYST: 2,
  ADMIN: 3,
};

export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.user.role];
    const hasAccess = roles.some((role) => userLevel >= ROLE_HIERARCHY[role]);

    if (!hasAccess) {
      sendError(res, `Access denied. Required role: ${roles.join(" or ")}`, 403);
      return;
    }

    next();
  };
};

export const adminOnly = requireRole("ADMIN");
export const analystAndAbove = requireRole("ANALYST");
export const allRoles = requireRole("VIEWER");
