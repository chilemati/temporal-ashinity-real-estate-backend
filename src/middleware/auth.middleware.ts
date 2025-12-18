import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };

    req.user = {
      id: payload.id,
      role: payload.role as "normal" | "seller" | "admin" | "superadmin",
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


export const isSellerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const allowedRoles = ["seller", "admin", "superadmin"];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: "Forbidden: Only seller, admin or superadmin can perform this action",
    });
  }

  next();
};
