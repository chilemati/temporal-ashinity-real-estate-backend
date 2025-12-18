import { Request, Response } from "express";
import { initializeWalletFunding, withdrawFromWallet, getUserWalletWithTransactions } from "../services/wallet.service";

export const fundWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const data = await initializeWalletFunding(userId, amount, email);

    res.json({
      success: true,
      authorizationUrl: data.authorization_url,
      reference: data.reference,
    });
  } catch (err: any) {
    console.error("Error in fundWallet:", err.response?.data || err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const withdrawWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ success: false, message: "Invalid amount" });

    const { transaction, paystackResponse } = await withdrawFromWallet(userId, amount);

    res.json({
      success: true,
      message: "Withdrawal initiated",
      transaction,
      paystackData: paystackResponse,
    });
  } catch (err: any) {
    console.error("Error in withdrawWallet:", err.response?.data || err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const wallet = await getUserWalletWithTransactions(userId);

    res.json({
      success: true,
      wallet,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
