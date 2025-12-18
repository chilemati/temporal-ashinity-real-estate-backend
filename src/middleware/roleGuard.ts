import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin"))
    return res.status(403).json({ message: "Admin access required" });

  next();
};

export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "superadmin")
    return res.status(403).json({ message: "Superadmin access required" });

  next();
};
