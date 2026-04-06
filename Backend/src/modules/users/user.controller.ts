import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../../middleware/auth.middleware";
import * as userService from "./user.service";
import { sendSuccess } from "../../utils/response";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const { users, total } = await userService.listUsers(page, limit);
    sendSuccess(res, users, "Users retrieved", 200, {
      page, limit, total, totalPages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
};

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, user, "User retrieved");
  } catch (err) { next(err); }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createUserSchema.parse(req.body);
    const user = await userService.createUser(input);
    sendSuccess(res, user, "User created", 201);
  } catch (err) { next(err); }
};

export const updateRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = z.object({ role: z.enum(["VIEWER", "ANALYST", "ADMIN"]) }).parse(req.body);
    const user = await userService.updateRole(req.params.id, role);
    sendSuccess(res, user, "Role updated");
  } catch (err) { next(err); }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) }).parse(req.body);
    const user = await userService.updateStatus(req.params.id, status);
    sendSuccess(res, user, "Status updated");
  } catch (err) { next(err); }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.softDeleteUser(req.params.id, req.user!.id);
    sendSuccess(res, user, "User deleted");
  } catch (err) { next(err); }
};
