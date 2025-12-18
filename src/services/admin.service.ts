import prisma from "../prismaClient";

export interface userType {
    role: "seller" | "normal" | "admin" | "superadmin" 
}

export const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });
};

export const updateUserRole = async (userId: number, role: userType["role"] ) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role }
  });
};

export const deleteUser = async (userId: number) => {
  return prisma.user.delete({
    where: { id: userId }
  });
};

export const suspendUser = async (userId: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: { kycStatus: "SUSPENDED" }
  });
};

