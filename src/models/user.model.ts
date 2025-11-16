import prisma from "../prismaClient";

export type User = Awaited<ReturnType<typeof prisma.user.findUnique>>;

// Find user by email
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// Create a new user (email/password)
export const createUser = async (data: {
  email: string;
  fullname?: string;
  password?: string; // optional for Google users
  googleId?: string;
}) => {
  return prisma.user.create({
    data,
  });
};

// Update KYC status
export const updateKYCStatus = async (
  userId: string,
  status: "PENDING" | "VERIFIED" | "REJECTED"
) => {
  return prisma.user.update({
    where: { id: Number(userId) },
    data: { kycStatus: status },
  });
};

// Update email OTP & verification
export const setEmailOTP = async (email: string, otp: string, expiresAt: Date) => {
  return prisma.user.update({
    where: { email },
    data: { emailOTP: otp, otpExpiresAt: expiresAt },
  });
};

export const verifyEmail = async (email: string) => {
  return prisma.user.update({
    where: { email },
    data: { emailVerified: true, emailOTP: null, otpExpiresAt: null },
  });
};

// Update phone OTP & verification
export const setPhoneOTP = async (userId: number, otp: string) => {
  return prisma.user.update({
    where: { id: Number(userId) },
    data: { phoneOTP: otp },
  });
};

export const verifyPhone = async (userId: number) => {
  return prisma.user.update({
    where: { id: Number(userId) },
    data: { phoneVerified: true, phoneOTP: null },
  });
};
