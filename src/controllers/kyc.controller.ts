import { Request, Response } from "express";
import * as kyc from "../services/kyc.service";

export async function updateStatus(req: Request, res: Response) {
  try {
    const user = await kyc.updateKYC(req.body.userId, req.body.status);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
