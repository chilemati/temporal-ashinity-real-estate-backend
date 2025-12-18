import prisma from "../prismaClient";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

// ---------------------------
// Initialize Wallet Funding
// ---------------------------
export const initializeWalletFunding = async (
  userId: number,
  amount: number,
  email: string
) => {
  if (amount < 500) throw new Error("Minimum funding amount is ₦500");

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error("Wallet not found");

  const reference = `FUND_${Date.now()}_${userId}`;

  // Save pending transaction
  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "FUND",
      amount,
      reference,
      status: "PENDING",
    },
  });

  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: amount * 100, // kobo
      reference,
      callback_url: `${FRONTEND_URL}/wallet/verify`, // must be public URL
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
};

// ---------------------------
// Withdraw from Wallet
// ---------------------------
export const withdrawFromWallet = async (userId: number, amount: number) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error("Wallet not found");
  if (wallet.balance.toNumber() < amount) throw new Error("Insufficient wallet balance");

  const bankAccount = await prisma.bankAccount.findUnique({ where: { userId } });
  if (!bankAccount || !bankAccount.recipientCode) {
    throw new Error("Bank account not linked or recipient not created");
  }

  const reference = uuidv4();
  const transaction = await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "WITHDRAW",
      amount,
      status: "PENDING",
      reference,
    },
  });

  const transferResponse = await axios.post(
    `${PAYSTACK_BASE_URL}/transfer`,
    {
      source: "balance",
      amount: amount * 100,
      recipient: bankAccount.recipientCode,
      reason: "Wallet Withdrawal",
      reference,
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return { transaction, paystackResponse: transferResponse.data };
};


// ---------------------------
// Wallet Helpers
// ---------------------------
export const createWalletForUser = async (userId: number) => {
  return prisma.wallet.create({
    data: { userId, balance: 0, currency: "NGN" },
  });
};

export const getUserWallet = async (userId: number) => {
  return prisma.wallet.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: "desc" } } },
  });
};

export const getUserWalletWithTransactions = async (userId: number) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!wallet) throw new Error("Wallet not found");
  return wallet;
};

