import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

// Mock BEFORE imports
jest.mock("../config/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
  },
}));
jest.mock("../config/env", () => ({
  env: {
    jwtSecret: "test-secret-key",
    jwtExpiresIn: "7d",
  },
}));

import { prisma } from "../config/prisma";
import { authenticate } from "../middleware/auth.middleware";
import userRoutes from "../modules/users/user.routes";

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, "test-secret-key", { expiresIn: "7d" });
};

const mockUsers = {
  admin: {
    id: "admin-1",
    name: "Admin User",
    email: "admin@test.com",
    role: "ADMIN" as Role,
    status: "ACTIVE",
    password: "hashed",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  analyst: {
    id: "analyst-1",
    name: "Analyst User",
    email: "analyst@test.com",
    role: "ANALYST" as Role,
    status: "ACTIVE",
    password: "hashed",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  viewer: {
    id: "viewer-1",
    name: "Viewer User",
    email: "viewer@test.com",
    role: "VIEWER" as Role,
    status: "ACTIVE",
    password: "hashed",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
};

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(authenticate);
  app.use("/api/users", userRoutes);
  return app;
};

describe("Users Routes with RBAC", () => {
  const app = createApp();
  const adminToken = generateToken(mockUsers.admin.id);
  const analystToken = generateToken(mockUsers.analyst.id);
  const viewerToken = generateToken(mockUsers.viewer.id);

  beforeEach(() => {
    jest.clearAllMocks();
    const mockPrisma = prisma as any;
    mockPrisma.user.findFirst.mockImplementation((args: any) => {
      const id = args?.where?.id;
      if (id === mockUsers.admin.id) return Promise.resolve(mockUsers.admin);
      if (id === mockUsers.analyst.id) return Promise.resolve(mockUsers.analyst);
      if (id === mockUsers.viewer.id) return Promise.resolve(mockUsers.viewer);
      return Promise.resolve(null);
    });
  });

  describe("Access Control", () => {
    it("denies requests without a token", async () => {
      const response = await request(app).get("/api/users");
      expect(response.status).toBe(401);
    });

    it("blocks ANALYST role", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${analystToken}`);

      expect(response.status).toBe(403);
    });

    it("blocks VIEWER role", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(response.status).toBe(403);
    });

    it("allows ADMIN role", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).not.toBe(403);
    });
  });

  describe("GET /api/users", () => {
    it("blocks non-admin", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /api/users", () => {
    it("blocks non-admin", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${analystToken}`)
        .send({
          name: "New",
          email: "new@test.com",
          password: "Pass123456",
        });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("blocks non-admin", async () => {
      const response = await request(app)
        .delete(`/api/users/${mockUsers.analyst.id}`)
        .set("Authorization", `Bearer ${analystToken}`);

      expect(response.status).toBe(403);
    });
  });
});


