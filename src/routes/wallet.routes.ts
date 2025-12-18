import { Router } from "express";
import { fundWallet, getWallet, withdrawWallet } from "../controllers/wallet.controller";
import { paystackWebhook } from "../controllers/paystack.webhook";
import { authMiddleware } from "../middleware/auth.middleware";

const routerWallet = Router();

// User initiates funding
routerWallet.post("/wallet/fund", authMiddleware, fundWallet);

// Paystack webhook (NO auth middleware)
routerWallet.post("/wallet/paystack/webhook", paystackWebhook);
routerWallet.post("/wallet/withdraw", authMiddleware, withdrawWallet);
routerWallet.get("/wallet", authMiddleware, getWallet);


export default routerWallet;
