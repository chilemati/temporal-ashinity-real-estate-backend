// controllers/paystack.webhook.ts
import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../prismaClient";

export const paystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-paystack-signature"] as string;

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = req.body;

    // ---------- FUNDING ----------
    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const amount = event.data.amount / 100; // Convert to Naira

      const transaction = await prisma.transaction.findUnique({ where: { reference } });

      if (!transaction || transaction.status === "SUCCESS") {
        return res.sendStatus(200); // Already processed
      }

      await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { increment: amount } },
        });

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "SUCCESS",
            paystackRef: event.data.id.toString(),
            channel: event.data.channel,
            metadata: event.data,
          },
        });
      });

      return res.sendStatus(200);
    }

    // ---------- WITHDRAWALS ----------
    if (event.event === "transfer.success" || event.event === "transfer.failed") {
      const reference = event.data.reference;
      const amount = event.data.amount / 100; // Convert to Naira

      const transaction = await prisma.transaction.findUnique({ where: { reference } });
      if (!transaction) return res.sendStatus(200); // Unknown transaction

      if (transaction.status === "SUCCESS") return res.sendStatus(200); // Already processed

      const status = event.event === "transfer.success" ? "SUCCESS" : "FAILED";

      await prisma.$transaction(async (tx) => {
        if (status === "FAILED") {
          // Refund amount back to wallet
          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: { balance: { increment: amount } },
          });
        }

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status,
            paystackRef: event.data.id.toString(),
            channel: event.data.channel,
            metadata: event.data,
          },
        });
      });

      return res.sendStatus(200);
    }

    // If other event types, just acknowledge
    return res.sendStatus(200);
  } catch (err: any) {
    console.error("Webhook error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
