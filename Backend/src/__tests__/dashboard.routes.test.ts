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
import dashboardRoutes from "../modules/dashboard/dashboard.routes";

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
  app.use("/api/dashboard", dashboardRoutes);
  return app;
};

describe("Dashboard Routes with RBAC", () => {
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

  describe("Access Control - Analyst+ only", () => {
    it("blocks VIEWER", async () => {
      const response = await request(app)
        .get("/api/dashboard/overview")
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(response.status).toBe(403);
    });

    it("allows ANALYST", async () => {
      const response = await request(app)
        .get("/api/dashboard/overview")
        .set("Authorization", `Bearer ${analystToken}`);

      expect(response.status).not.toBe(403);
    });

    it("allows ADMIN", async () => {
      const response = await request(app)
        .get("/api/dashboard/overview")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).not.toBe(403);
    });

    it("blocks unauthenticated", async () => {
      const response = await request(app).get("/api/dashboard/overview");
      expect(response.status).toBe(401);
    });
  });

  describe("Dashboard Endpoints", () => {
    const endpoints = [
      "/api/dashboard/overview",
      "/api/dashboard/categories",
      "/api/dashboard/trends/monthly",
      "/api/dashboard/trends/weekly",
      "/api/dashboard/recent",
    ];

    it("blocks VIEWER on all endpoints", async () => {
      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set("Authorization", `Bearer ${viewerToken}`);

        expect(response.status).toBe(403);
      }
    });

    it("allows ANALYST on all endpoints", async () => {
      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set("Authorization", `Bearer ${analystToken}`);

        expect(response.status).not.toBe(403);
      }
    });

    it("allows ADMIN on all endpoints", async () => {
      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).not.toBe(403);
      }
    });
  });

  describe("Query Parameters", () => {
    it("handles monthly trends with months param", async () => {
      const response = await request(app)
        .get("/api/dashboard/trends/monthly?months=12")
        .set("Authorization", `Bearer ${analystToken}`);

      expect(response.status).not.toBe(403);
    });

    it("handles weekly trends with weeks param", async () => {
      const response = await request(app)
        .get("/api/dashboard/trends/weekly?weeks=4")
        .set("Authorization", `Bearer ${analystToken}`);

      expect(response.status).not.toBe(403);
    });

    it("handles recent activity with limit param", async () => {
      const response = await request(app)
        .get("/api/dashboard/recent?limit=20")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).not.toBe(403);
    });
  });
});

