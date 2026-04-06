import bcrypt from "bcryptjs";
import type { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const listUsers = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      select: USER_SELECT,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);
  return { users, total };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: USER_SELECT,
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const createUser = async (input: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("Email already in use", 409);

  const hashed = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: { ...input, password: hashed, role: input.role ?? "VIEWER" },
    select: USER_SELECT,
  });
};

export const updateRole = async (id: string, role: Role) => {
  await getUserById(id);
  return prisma.user.update({ where: { id }, data: { role }, select: USER_SELECT });
};

export const updateStatus = async (id: string, status: UserStatus) => {
  await getUserById(id);
  return prisma.user.update({ where: { id }, data: { status }, select: USER_SELECT });
};

export const softDeleteUser = async (id: string, requesterId: string) => {
  if (id === requesterId) throw new AppError("You cannot delete your own account", 400);
  await getUserById(id);
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
    select: USER_SELECT,
  });
};
