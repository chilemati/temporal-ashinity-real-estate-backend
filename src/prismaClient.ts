import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development (Next.js/Hot Reloading)
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
