import { Router } from "express";
import {
  fetchUsers,
  promoteUser,
  demoteUser,
  removeUser,
  suspendUserAccount,
} from "../controllers/admin.controller";
import { isAdmin, isSuperAdmin } from "../middleware/roleGuard";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// ADMIN + SUPERADMIN
router.get("/users",authMiddleware, isAdmin, fetchUsers);
router.delete("/user/:userId",authMiddleware, isAdmin, removeUser);
router.patch("/suspend/:userId",authMiddleware, isAdmin, suspendUserAccount);

// SUPERADMIN ONLY
router.post("/promote",authMiddleware, isSuperAdmin, promoteUser);
router.post("/demote",authMiddleware, isSuperAdmin, demoteUser);

export default router;
