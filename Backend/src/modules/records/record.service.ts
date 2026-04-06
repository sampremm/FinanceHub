import type { RecordType, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { invalidationPatterns } from "../../utils/cache";

export interface RecordFilters {
  type?: RecordType;
  category?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

type UserContext = {
  id: string;
  role: "VIEWER" | "ANALYST" | "ADMIN";
};

const RECORD_SELECT = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

// ✅ LIST RECORDS (ROLE BASED)
export const listRecords = async (
  filters: RecordFilters,
  user: UserContext
) => {
  const where: Prisma.FinancialRecordWhereInput = {
    deletedAt: null,
  };

  // 🔥 CORE LOGIC
  if (user.role === "VIEWER") {
    where.createdById = user.id; // only own records
  }
  // ANALYST + ADMIN → can see all

  if (filters.type) where.type = filters.type;

  if (filters.category) {
    where.category = {
      contains: filters.category,
      mode: "insensitive",
    };
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      (where.date as Prisma.DateTimeFilter).gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      (where.date as Prisma.DateTimeFilter).lte = new Date(filters.endDate);
    }
  }

  const skip = (filters.page - 1) * filters.limit;

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      select: RECORD_SELECT,
      skip,
      take: filters.limit,
      orderBy: { date: "desc" },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return { records, total };
};

// ✅ GET SINGLE RECORD (SECURE)
export const getRecordById = async (
  id: string,
  user: UserContext
) => {
  const where: Prisma.FinancialRecordWhereInput = {
    id,
    deletedAt: null,
  };

  if (user.role === "VIEWER") {
    where.createdById = user.id;
  }

  const record = await prisma.financialRecord.findFirst({
    where,
    select: RECORD_SELECT,
  });

  if (!record) throw new AppError("Record not found", 404);

  return record;
};

// ✅ CREATE RECORD (ALL USERS CAN ADD)
export const createRecord = async (input: {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
  createdById: string;
}) => {
  const record = await prisma.financialRecord.create({
    data: {
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: new Date(input.date),
      notes: input.notes ?? null,
      createdById: input.createdById,
    },
    select: RECORD_SELECT,
  });

  // 🚀 Invalidate dashboard cache
  await invalidationPatterns.onRecordChange(input.createdById);

  return record;
};

// ✅ UPDATE RECORD (ADMIN ONLY — but still safe)
export const updateRecord = async (
  id: string,
  input: {
    amount?: number;
    type?: RecordType;
    category?: string;
    date?: string;
    notes?: string;
  },
  user: UserContext
) => {
  const currentRecord = await getRecordById(id, user);

  const record = await prisma.financialRecord.update({
    where: { id },
    data: {
      ...input,
      ...(input.date && { date: new Date(input.date) }),
    },
    select: RECORD_SELECT,
  });

  // 🚀 Invalidate dashboard cache
  await invalidationPatterns.onRecordChange(currentRecord.createdBy.id);

  return record;
};

// ✅ SOFT DELETE (ADMIN ONLY — safe)
export const softDeleteRecord = async (
  id: string,
  user: UserContext
) => {
  const currentRecord = await getRecordById(id, user);

  const record = await prisma.financialRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: RECORD_SELECT,
  });

  // 🚀 Invalidate dashboard cache
  await invalidationPatterns.onRecordChange(currentRecord.createdBy.id);

  return record;
};