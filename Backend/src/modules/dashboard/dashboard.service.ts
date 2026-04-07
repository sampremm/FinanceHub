import { prisma } from "../../config/prisma";
import { withCache, cacheKeys } from "../../utils/cache";

const _getOverviewFromDb = async (userId?: string) => {
  const whereClause = userId ? { deletedAt: null, createdById: userId } : { deletedAt: null };
  const records = await prisma.financialRecord.groupBy({
    by: ["type"],
    where: whereClause,
    _sum: { amount: true },
  });

  const totalRecords = await prisma.financialRecord.count({ where: whereClause });
  const income = records.find((r) => r.type === "INCOME")?._sum.amount ?? 0;
  const expenses = records.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0;

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netBalance: income - expenses,
    totalRecords,
  };
};

export const getOverview = async (userId?: string) => {
  return withCache(
    cacheKeys.overview(userId),
    () => _getOverviewFromDb(userId),
    { ttl: 600 } // 10 minutes
  );
};

const _getUserSpendingFromDb = async () => {
  const spendingByUser = await prisma.financialRecord.groupBy({
    by: ["createdById", "type"],
    where: { deletedAt: null },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  const userIds = Array.from(new Set(spendingByUser.map((row) => row.createdById)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });

  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user.name;
    return acc;
  }, {} as Record<string, string>);

  const grouped = spendingByUser.reduce((acc, row) => {
    const userId = row.createdById;
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        userName: userMap[userId] ?? "Unknown",
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        recordCount: 0,
      };
    }

    if (row.type === "INCOME") {
      acc[userId].totalIncome = row._sum.amount ?? 0;
    } else {
      acc[userId].totalExpenses = row._sum.amount ?? 0;
    }
    acc[userId].recordCount += row._count.id;
    return acc;
  }, {} as Record<string, {
    userId: string;
    userName: string;
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    recordCount: number;
  }>);

  return Object.values(grouped).map((entry) => ({
    ...entry,
    netBalance: entry.totalIncome - entry.totalExpenses,
  }));
};

export const getUserSpending = async () => {
  return withCache(
    cacheKeys.userSpending,
    () => _getUserSpendingFromDb(),
    { ttl: 900 } // 15 minutes
  );
};

const _getCategoryTotalsFromDb = async (userId?: string) => {
  const whereClause = userId ? { deletedAt: null, createdById: userId } : { deletedAt: null };
  const results = await prisma.financialRecord.groupBy({
    by: ["category", "type"],
    where: whereClause,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  return results.map((r) => ({
    category: r.category,
    type: r.type,
    total: r._sum.amount ?? 0,
    count: r._count.id,
  }));
};

export const getCategoryTotals = async (userId?: string) => {
  return withCache(
    cacheKeys.categories(userId),
    () => _getCategoryTotalsFromDb(userId),
    { ttl: 600 } // 10 minutes
  );
};

const _getMonthlyTrendsFromDb = async (months = 6, userId?: string) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const whereClause = userId ? { deletedAt: null, date: { gte: since }, createdById: userId } : { deletedAt: null, date: { gte: since } };
  const records = await prisma.financialRecord.findMany({
    where: whereClause,
    select: { amount: true, type: true, date: true },
    orderBy: { date: "asc" },
  });

  const buckets: Record<string, { income: number; expenses: number }> = {};

  for (const r of records) {
    const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { income: 0, expenses: 0 };
    if (r.type === "INCOME") buckets[key].income += r.amount;
    else buckets[key].expenses += r.amount;
  }

  return Object.entries(buckets).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    net: data.income - data.expenses,
  }));
};

export const getMonthlyTrends = async (months = 6, userId?: string) => {
  return withCache(
    cacheKeys.monthlyTrends(months, userId),
    () => _getMonthlyTrendsFromDb(months, userId),
    { ttl: 1800 } // 30 minutes
  );
};

const _getWeeklyTrendsFromDb = async (weeks = 8, userId?: string) => {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const whereClause = userId ? { deletedAt: null, date: { gte: since }, createdById: userId } : { deletedAt: null, date: { gte: since } };
  const records = await prisma.financialRecord.findMany({
    where: whereClause,
    select: { amount: true, type: true, date: true },
    orderBy: { date: "asc" },
  });

  const buckets: Record<string, { income: number; expenses: number }> = {};

  for (const r of records) {
    const d = new Date(r.date);
    const startOfYear = new Date(d.getFullYear(), 0, 0).getTime();
    const dayOfYear = Math.floor((d.getTime() - startOfYear) / 86400000);
    const week = Math.ceil(dayOfYear / 7);
    const key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { income: 0, expenses: 0 };
    if (r.type === "INCOME") buckets[key].income += r.amount;
    else buckets[key].expenses += r.amount;
  }

  return Object.entries(buckets).map(([week, data]) => ({
    week,
    income: data.income,
    expenses: data.expenses,
    net: data.income - data.expenses,
  }));
};

export const getWeeklyTrends = async (weeks = 8, userId?: string) => {
  return withCache(
    cacheKeys.weeklyTrends(weeks, userId),
    () => _getWeeklyTrendsFromDb(weeks, userId),
    { ttl: 900 } // 15 minutes
  );
};

const _getRecentActivityFromDb = async (limit = 10, userId?: string) => {
  const whereClause = userId ? { deletedAt: null, createdById: userId } : { deletedAt: null };
  return prisma.financialRecord.findMany({
    where: whereClause,
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      date: true,
      notes: true,
      createdBy: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: limit,
  });
};

export const getRecentActivity = async (limit = 10, userId?: string) => {
  return withCache(
    cacheKeys.recentActivity(limit, userId),
    () => _getRecentActivityFromDb(limit, userId),
    { ttl: 300 } // 5 minutes
  );
};
