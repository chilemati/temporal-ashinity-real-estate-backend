import { Request, Response } from "express";
import * as kyc from "../services/kyc.service";

export async function updateStatus(req: Request, res: Response) {
  try {
    const user = await kyc.updateKYC(req.body.userId, req.body.status);
    res.json({ success: true, user });
  } catch (err: unknown) {
   // Safely check if the caught error is an instance of the native Error class
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      // Handle cases where the error is not a standard Error object (e.g., a thrown string or number)
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
}
