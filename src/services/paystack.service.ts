// services/paystack.service.ts
import axios from "axios";
import prisma from "../prismaClient";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const createPaystackRecipient = async (userId: number) => {
  const bankAccount = await prisma.bankAccount.findUnique({ where: { userId } });
  if (!bankAccount) throw new Error("Bank account not linked");

  if (bankAccount.recipientCode) return bankAccount.recipientCode;

  // Call Paystack API to create recipient
  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transferrecipient`,
    {
      type: "nuban",
      name: bankAccount.accountName,
      account_number: bankAccount.accountNumber,
      bank_code: bankAccount.bankCode,
      currency: "NGN",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const recipientCode = response.data.data.recipient_code;

  // Save recipient code in DB
  await prisma.bankAccount.update({
    where: { userId },
    data: { recipientCode },
  });

  return recipientCode;
};
