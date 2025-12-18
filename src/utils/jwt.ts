import jwt from "jsonwebtoken";

interface JwtPayloadData {
  id: string | number; // Assuming your user IDs are strings or numbers
  // You could also add 'role', 'email', etc. here if needed.
  role?: "normal" | "seller" | "admin" | "superadmin";
}
export function signToken(payload: JwtPayloadData) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}
