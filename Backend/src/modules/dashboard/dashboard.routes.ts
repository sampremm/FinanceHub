import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { allRoles } from "../../middleware/rbac.middleware";
import {
  getOverview,
  getUserSpending,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
} from "./dashboard.controller";
import { analystAndAbove } from "../../middleware/rbac.middleware";

const router = Router();

// All authenticated users
router.use(authenticate, allRoles);

router.get("/overview", getOverview);
router.get("/categories", getCategoryTotals);
router.get("/trends/monthly", getMonthlyTrends);
router.get("/trends/weekly", getWeeklyTrends);
router.get("/recent", getRecentActivity);
router.get("/users", analystAndAbove, getUserSpending);

export default router;
