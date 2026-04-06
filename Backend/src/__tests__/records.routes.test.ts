import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

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
import recordRoutes from "../modules/records/record.routes";

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, "test-secret-key", { expiresIn: "7d" });
};

const mockUsers = {
  admin: { id: "admin-1", name: "Admin", email: "admin@test.com", role: "ADMIN" as Role, status: "ACTIVE", password: "hashed", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
  analyst: { id: "analyst-1", name: "Analyst", email: "analyst@test.com", role: "ANALYST" as Role, status: "ACTIVE", password: "hashed", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
  viewer: { id: "viewer-1", name: "Viewer", email: "viewer@test.com", role: "VIEWER" as Role, status: "ACTIVE", password: "hashed", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
};

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(authenticate);
  app.use("/api/records", recordRoutes);
  return app;
};

describe("Records Routes with RBAC", () => {
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

  describe("GET /api/records", () => {
    it("allows all roles to list records", async () => {
      for (const token of [adminToken, analystToken, viewerToken]) {
        const response = await request(app)
          .get("/api/records")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).not.toBe(403);
      }
    });

    it("blocks unauthenticated", async () => {
      const response = await request(app).get("/api/records");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/records/:id", () => {
    it("allows all roles", async () => {
      for (const token of [adminToken, analystToken, viewerToken]) {
        const response = await request(app)
          .get("/api/records/123")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).not.toBe(403);
      }
    });
  });

  describe("POST /api/records", () => {
    const payload = { amount: 50, type: "EXPENSE", category: "Food", date: new Date().toISOString() };

    it("allows all roles", async () => {
      for (const token of [adminToken, analystToken, viewerToken]) {
        const response = await request(app)
          .post("/api/records")
          .set("Authorization", `Bearer ${token}`)
          .send(payload);

        expect(response.status).not.toBe(403);
      }
    });
  });

  describe("PATCH /api/records/:id", () => {
    it("blocks non-admin", async () => {
      const response = await request(app)
        .patch("/api/records/123")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({ amount: 100 });

      expect(response.status).toBe(403);
    });

    it("allows admin", async () => {
      const response = await request(app)
        .patch("/api/records/123")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ amount: 100 });

      expect(response.status).not.toBe(403);
    });
  });

  describe("DELETE /api/records/:id", () => {
    it("blocks non-admin", async () => {
      const response = await request(app)
        .delete("/api/records/123")
        .set("Authorization", `Bearer ${analystToken}`);

      expect(response.status).toBe(403);
    });

    it("allows admin", async () => {
      const response = await request(app)
        .delete("/api/records/123")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).not.toBe(403);
    });
  });
});

