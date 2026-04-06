import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/rbac.middleware";
import { listUsers, getUser, createUser, updateRole, updateStatus, deleteUser } from "./user.controller";

const router = Router();

router.use(authenticate, adminOnly);

router.get("/", listUsers);
router.post("/", createUser);
router.get("/:id", getUser);
router.patch("/:id/role", updateRole);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteUser);

export default router;
