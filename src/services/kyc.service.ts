import prisma from "../prismaClient";

export async function updateKYC(userId: string, status: "PENDING" | "VERIFIED" | "REJECTED") {
  return prisma.user.update({
    where: { id: userId },
    data: { kycStatus: status }
  });
}
