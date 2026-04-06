import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { adminOnly, allRoles } from "../../middleware/rbac.middleware";
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord
} from "./record.controller";

const router = Router();

router.use(authenticate);

router.get("/", allRoles, listRecords);
router.get("/:id", allRoles, getRecord);
router.post("/", allRoles, createRecord);
router.patch("/:id", adminOnly, updateRecord);
router.delete("/:id", adminOnly, deleteRecord);

export default router; // 🔥 MUST BE DEFAULT EXPORT