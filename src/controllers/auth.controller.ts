import { Request, Response } from "express";
import * as auth from "../services/auth.service";

export async function register(req: Request, res: Response) {
  try {
    const user = await auth.register(req.body);
    res.json({ success: true, message: "OTP sent to email", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const user = await auth.verifyEmailOTP(req.body.email, req.body.otp);
    res.json({ success: true, message: "Email verified", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = await auth.login(req.body);
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    await auth.forgotPassword(req.body.email);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const user = await auth.resetPassword(
      req.body.email,
      req.body.otp,
      req.body.newPassword
    );
    res.json({ success: true, message: "Password reset successful", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    const data = await auth.loginWithGoogle(
      req.body.googleId,
      req.body.email,
      req.body.fullname
    );
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function sendPhoneOTP(req: Request, res: Response) {
  try {
    await auth.sendPhoneOTP(req.body.userId, req.body.phone);
    res.json({ success: true, message: "OTP sent to phone" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function verifyPhoneOTP(req: Request, res: Response) {
  try {
    const user = await auth.verifyPhoneOTP(req.body.userId, req.body.otp);
    res.json({ success: true, message: "Phone verified", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
