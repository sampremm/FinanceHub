import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../../middleware/auth.middleware";
import * as dashboardService from "./dashboard.service";
import { sendSuccess } from "../../utils/response";

export const getOverview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.role === "VIEWER" ? req.user!.id : undefined;
    const data = await dashboardService.getOverview(userId);
    sendSuccess(res, data, "Overview retrieved");
  } catch (err) { next(err); }
};

export const getUserSpending = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getUserSpending();
    sendSuccess(res, data, "User spending data retrieved");
  } catch (err) {
    next(err);
  }
};

export const getCategoryTotals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.role === "VIEWER" ? req.user!.id : undefined;
    const data = await dashboardService.getCategoryTotals(userId);
    sendSuccess(res, data, "Category totals retrieved");
  } catch (err) { next(err); }
};

export const getMonthlyTrends = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { months } = z
      .object({ months: z.coerce.number().int().min(1).max(24).default(6) })
      .parse(req.query);
    const userId = req.user!.role === 'VIEWER' ? req.user!.id : undefined;
    const data = await dashboardService.getMonthlyTrends(months, userId);
    sendSuccess(res, data, "Monthly trends retrieved");
  } catch (err) { next(err); }
};

export const getWeeklyTrends = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { weeks } = z
      .object({ weeks: z.coerce.number().int().min(1).max(52).default(8) })
      .parse(req.query);
    const userId = req.user!.role === 'VIEWER' ? req.user!.id : undefined;
    const data = await dashboardService.getWeeklyTrends(weeks, userId);
    sendSuccess(res, data, "Weekly trends retrieved");
  } catch (err) { next(err); }
};

export const getRecentActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit } = z
      .object({ limit: z.coerce.number().int().min(1).max(50).default(10) })
      .parse(req.query);
    const userId = req.user!.role === 'VIEWER' ? req.user!.id : undefined;
    const data = await dashboardService.getRecentActivity(limit, userId);
    sendSuccess(res, data, "Recent activity retrieved");
  } catch (err) { next(err); }
};
