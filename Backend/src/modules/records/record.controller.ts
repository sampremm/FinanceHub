import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../../middleware/auth.middleware";
import * as recordService from "./record.service";
import { sendSuccess } from "../../utils/response";

const createRecordSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required").max(100),
  date: z.string().datetime({
    message: "Invalid date. Use ISO 8601 e.g. 2024-04-01T00:00:00.000Z",
  }).optional(),
  notes: z.string().max(500).optional(),
});

const updateRecordSchema = createRecordSchema.partial();

const filterSchema = z.object({
  type: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    return value;
  }, z.enum(["INCOME", "EXPENSE"]).optional()),
  category: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    return value;
  }, z.string().optional()),
  startDate: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    return value;
  }, z.string().optional()),
  endDate: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    return value;
  }, z.string().optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ✅ LIST (PASS USER)
export const listRecords = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = filterSchema.parse(req.query);

    const { records, total } = await recordService.listRecords(
      filters,
      req.user! // 🔥 IMPORTANT
    );

    sendSuccess(res, records, "Records retrieved", 200, {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (err) {
    next(err);
  }
};

// ✅ GET SINGLE (PASS USER)
export const getRecord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const record = await recordService.getRecordById(
      req.params.id,
      req.user! // 🔥 IMPORTANT
    );

    sendSuccess(res, record, "Record retrieved");
  } catch (err) {
    next(err);
  }
};

// ✅ CREATE (ALREADY CORRECT)
export const createRecord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = createRecordSchema.parse(req.body);

    const record = await recordService.createRecord({
      ...input,
      date: input.date ?? new Date().toISOString(),
      createdById: req.user!.id,
    });

    sendSuccess(res, record, "Record created", 201);
  } catch (err) {
    next(err);
  }
};

// ✅ UPDATE (PASS USER)
export const updateRecord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = updateRecordSchema.parse(req.body);

    const record = await recordService.updateRecord(
      req.params.id,
      input,
      req.user! // 🔥 IMPORTANT
    );

    sendSuccess(res, record, "Record updated");
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE (PASS USER)
export const deleteRecord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const record = await recordService.softDeleteRecord(
      req.params.id,
      req.user! // 🔥 IMPORTANT
    );

    sendSuccess(res, record, "Record deleted");
  } catch (err) {
    next(err);
  }
};