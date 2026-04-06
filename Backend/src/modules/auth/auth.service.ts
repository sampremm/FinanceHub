import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

const generateToken = (userId: string): string =>
  jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });

const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("Email already in use", 409);

  const hashed = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: input.role ?? "VIEWER",
    },
  });

  return { user: sanitizeUser(user), token: generateToken(user.id) };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null },
  });

  if (!user) throw new AppError("Invalid email or password", 401);
  if (user.status === "INACTIVE") throw new AppError("Account is inactive", 403);

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new AppError("Invalid email or password", 401);

  return { user: sanitizeUser(user), token: generateToken(user.id) };
};
