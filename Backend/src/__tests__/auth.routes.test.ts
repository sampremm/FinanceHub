import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { Role } from "@prisma/client";
import authRoutes from "../modules/auth/auth.routes";

// Mock Prisma
jest.mock("../config/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
}));

import { prisma } from "../config/prisma";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  return app;
};

describe("Auth Routes", () => {
  const app = createApp();
  const mockPrisma = prisma as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("successfully registers a new user with VIEWER role by default", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-123",
        name: "New User",
        email: "newuser@test.com",
        password: "hashed_password",
        role: "VIEWER",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "New User",
          email: "newuser@test.com",
          password: "SecurePass123",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe("VIEWER");
    });

    it("registers a user with a specific role", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-456",
        name: "Admin User",
        email: "admin@test.com",
        password: "hashed_password",
        role: "ADMIN",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Admin User",
          email: "admin@test.com",
          password: "SecurePass123",
          role: "ADMIN",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.role).toBe("ADMIN");
    });

    it("rejects duplicate email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "existing-user",
        name: "Existing User",
        email: "existing@test.com",
        password: "hashed",
        role: "VIEWER",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "New User",
          email: "existing@test.com",
          password: "SecurePass123",
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it("rejects invalid password format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "User",
          email: "user@test.com",
          password: "weak", // Too short and no number
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("rejects invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "User",
          email: "invalid-email",
          password: "SecurePass123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("successfully logs in a user", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "user-123",
        name: "Test User",
        email: "test@test.com",
        password: "hashed_password",
        role: "ANALYST",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "TestPass123",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe("ANALYST");
    });

    it("rejects invalid credentials", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@test.com",
          password: "SomePass123",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("rejects login for inactive users", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "user-123",
        name: "Inactive User",
        email: "inactive@test.com",
        password: "hashed_password",
        role: "VIEWER",
        status: "INACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "inactive@test.com",
          password: "SomePass123",
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it("rejects missing password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
