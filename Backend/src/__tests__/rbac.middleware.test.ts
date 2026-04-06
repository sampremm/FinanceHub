import express, { Request, Response } from "express";
import request from "supertest";
import { adminOnly, analystAndAbove, allRoles } from "../middleware/rbac.middleware";
import type { Role } from "@prisma/client";

type TestUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const withTestUser = (req: Request, _res: Response, next: () => void) => {
  const role = req.headers["x-test-role"] as string | undefined;
  if (role) {
    (req as Request & { user?: TestUser }).user = {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      role: role as Role,
    };
  }
  next();
};

const createApp = () => {
  const app = express();
  app.use(withTestUser);

  app.get("/admin", adminOnly, (_req, res) => res.status(200).json({ success: true }));
  app.get("/analyst", analystAndAbove, (_req, res) => res.status(200).json({ success: true }));
  app.get("/viewer", allRoles, (_req, res) => res.status(200).json({ success: true }));

  return app;
};

describe("RBAC middleware", () => {
  const app = createApp();

  it("denies access without authentication", async () => {
    const response = await request(app).get("/admin");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ success: false, message: "Authentication required" });
  });

  it("allows ADMIN access to ADMIN-only routes", async () => {
    const response = await request(app).get("/admin").set("x-test-role", "ADMIN");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it("blocks VIEWER and ANALYST from ADMIN-only routes", async () => {
    for (const role of ["VIEWER", "ANALYST"] as Role[]) {
      const response = await request(app).get("/admin").set("x-test-role", role);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        message: "Access denied. Required role: ADMIN",
      });
    }
  });

  it("allows ANALYST and ADMIN to access analyst-level routes", async () => {
    for (const role of ["ANALYST", "ADMIN"] as Role[]) {
      const response = await request(app).get("/analyst").set("x-test-role", role);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    }
  });

  it("blocks VIEWER from analyst-level routes", async () => {
    const response = await request(app).get("/analyst").set("x-test-role", "VIEWER");
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      message: "Access denied. Required role: ANALYST",
    });
  });

  it("allows VIEWER, ANALYST, and ADMIN to access viewer-level routes", async () => {
    for (const role of ["VIEWER", "ANALYST", "ADMIN"] as Role[]) {
      const response = await request(app).get("/viewer").set("x-test-role", role);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    }
  });
});
