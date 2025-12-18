import { Request, Response } from "express";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  suspendUser,
} from "../services/admin.service";

export const fetchUsers = async (req: Request, res: Response) => {
  const users = await getAllUsers();
  return res.json(users);
};

// SUPERADMIN ONLY
export const promoteUser = async (req: Request, res: Response) => {
  const { userId, newRole } = req.body;

  if (!["normal", "seller", "admin", "superadmin"].includes(newRole))
    return res.status(400).json({ message: "Invalid role" });

  const updated = await updateUserRole(Number(userId), newRole);
  return res.json({ message: "User role updated", updated });
};

export const demoteUser = async (req: Request, res: Response) => {
  const { userId, newRole } = req.body;

  const updated = await updateUserRole(Number(userId), newRole);
  return res.json({ message: "User demoted successfully", updated });
};

// ADMIN + SUPERADMIN
export const removeUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const deleted = await deleteUser(Number(userId));
  return res.json({ message: "User removed", deleted });
};

export const suspendUserAccount = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const suspended = await suspendUser(Number(userId));
  return res.json({ message: "User suspended", suspended });
};
