import prisma from "../prismaClient";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { generateOTP, otpExpiry } from "../utils/otp";
import { sendEmailOTP } from "./email.service";
import { sendSMSOTP } from "./sms.service";

// Define interfaces for expected input data
interface RegisterUserData {
  email: string;
  fullname: string;
  password: string;
}

interface LoginUserData {
  email: string;
  password: string;
}

// REGISTER USER
export async function register(data: RegisterUserData) {
  const exists = await prisma.user.findUnique({ where: { email: data.email }});
  if (exists) throw new Error("Email already registered");

  const hashed = await hashPassword(data.password);
  const otp = generateOTP();

  const user = await prisma.user.create({
    data: {
      email: data.email,
      fullname: data.fullname,
      password: hashed,
      emailOTP: otp,
      otpExpiresAt: otpExpiry()
    }
  });

  // SEND OTP EMAIL VIA NODEMAILER
  await sendEmailOTP(data.email, otp);

  return {
    success: true,
    message: "OTP sent to email",
    user
  };
}


// LOGIN USER
export async function login(data: LoginUserData) {
  const user = await prisma.user.findUnique({ where: { email: data.email }});
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(data.password, user.password!);
  if (!valid) throw new Error("Invalid credentials");

  if (!user.emailVerified) throw new Error("Email not verified");

  const token = signToken({ id: user.id });

  return { token, user };
}


// VERIFY EMAIL OTP
export async function verifyEmailOTP(email: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) throw new Error("User not found");

  if (user.emailOTP !== otp) throw new Error("Invalid OTP");
  if (user.otpExpiresAt! < new Date()) throw new Error("OTP expired");

  return prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      emailOTP: null,
      otpExpiresAt: null
    }
  });
}


// FORGOT PASSWORD → SEND OTP
// SERVICE FUNCTION
export async function handleForgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) throw new Error("User not found");

  const otp = generateOTP();

  await prisma.user.update({
    where: { email },
    data: {
      emailOTP: otp,
      otpExpiresAt: otpExpiry()
    }
  });

    try {
        await sendEmailOTP(email, otp);
        console.log(`Email sent successfully to ${email}`);
    } catch (emailError) {
        console.error("FAILED TO SEND EMAIL OTP:", emailError); // THIS LOG IS KEY
        throw new Error("Failed to send verification email. Please try again later.");
    }
    return true;

}



// RESET PASSWORD
export async function resetPassword(email: string, otp: string, newPass: string) {
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) throw new Error("User not found");

  if (user.emailOTP !== otp) throw new Error("Invalid OTP");
  if (user.otpExpiresAt! < new Date()) throw new Error("OTP expired");

  const hashed = await hashPassword(newPass);

  return prisma.user.update({
    where: { email },
    data: {
      password: hashed,
      emailOTP: null,
      otpExpiresAt: null
    }
  });
}


// LOGIN WITH GOOGLE
export async function loginWithGoogle(googleId: string, email: string, fullname: string) {
  let user = await prisma.user.findUnique({ where: { googleId }});

  if (!user) {
    user = await prisma.user.upsert({
      where: { email },
      update: { googleId },
      create: {
        googleId,
        email,
        fullname,
        emailVerified: true
      }
    });
  }

  const token = signToken({ id: user.id });
  return { token, user };
}


// SEND PHONE OTP (SMS)
export async function sendPhoneOTP(userId: string, phone: string) {
  const otp = generateOTP();

  await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      phone,
      phoneOTP: otp,
      otpExpiresAt: otpExpiry()
    }
  });

  // SEND SMS USING TWILIO
  await sendSMSOTP(phone, otp);

  return true;
}


// VERIFY PHONE OTP
export async function verifyPhoneOTP(userId: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) }});
  if (!user) throw new Error("User not found");

  if (user.phoneOTP !== otp) throw new Error("Invalid OTP");
  if (user.otpExpiresAt! < new Date()) throw new Error("OTP expired");

  return prisma.user.update({
    where: { id: Number(userId) },
    data: {
      phoneVerified: true,
      phoneOTP: null,
      otpExpiresAt: null
    }
  });
}
