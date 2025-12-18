import express, { Request, Response } from "express";
import * as auth from "../controllers/auth.controller";
import axios from "axios";

import {
  registerValidationRules,
  loginValidationRules,
  verifyEmailValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  googleLoginValidationRules,
  phoneOTPValidationRules,
  verifyPhoneOTPValidationRules,
  validate,
  updateProfileValidationRules,
} from "../middleware/validate";
import { generateOTP } from "../utils/otp";
import { sendEmailOTP } from "../services/email.service";

const router = express.Router();

router.post("/register", registerValidationRules, validate, auth.register);

router.post("/resend-otp", auth.resendOTPController);

router.post("/login", loginValidationRules, validate, auth.login);

router.post(
  "/verify-email",
  verifyEmailValidationRules,
  validate,
  auth.verifyEmail
);

router.post(
  "/forgot-password",
  forgotPasswordValidationRules,
  validate,
  auth.forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordValidationRules,
  validate,
  auth.resetPassword
);

router.post(
  "/google-login",
  googleLoginValidationRules,
  validate,
  auth.googleLogin
);

router.post(
  "/send-phone-otp",
  phoneOTPValidationRules,
  validate,
  auth.sendPhoneOTP
);

router.post(
  "/verify-phone-otp",
  verifyPhoneOTPValidationRules,
  validate,
  auth.verifyPhoneOTP
);

router.put(
  "/update-profile",
  updateProfileValidationRules,
  validate,
  auth.updateProfile
);

router.post("/email_phone-availability", auth.emailPhoneAvailability);

router.post("/send-email", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email  is required",
      });
    }

    // Generate OTP internally
    const otp = generateOTP();

    // Send email via your service
    const result = await sendEmailOTP(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP email sent successfully",
    });
  } catch (error: any) {
    console.error("Email error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP email",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
