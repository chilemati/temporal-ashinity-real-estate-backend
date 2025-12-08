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
  updateProfileValidationRules
} from "../middleware/validate";
import { generateOTP } from "../utils/otp";
import { sendEmailOTP } from "../services/email.service";



const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user and send OTP to email
 *     description: Creates a new user using only email. Sends OTP for verification. No password is required during registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: Email already registered or invalid input
 */
router.post("/register", registerValidationRules, validate, auth.register);


/**
 * @openapi
 * /auth/resend-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Resend email OTP
 *     description: Sends a new OTP if the old one has expired. If OTP is still valid, user must wait.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: User not found or OTP still valid
 */
router.post("/resend-otp", auth.resendOTPController);


/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: OTP based login with email
 *     description: 
 *       - If password is included → performs password login  
 *       - If password is omitted → sends OTP to email for login  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful or OTP sent
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", loginValidationRules, validate, auth.login);


/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify email using OTP
 *     description: Confirms user's email during registration or OTP login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-email", verifyEmailValidationRules, validate, auth.verifyEmail);


/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Send OTP for password reset
 *     description: This works only for accounts created with a password. OTP-only accounts cannot reset passwords.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: User not found or account uses OTP-only login
 */
router.post("/forgot-password", forgotPasswordValidationRules, validate, auth.forgotPassword);


/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password using OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/reset-password", resetPasswordValidationRules, validate, auth.resetPassword);


/**
 * @openapi
 * /auth/google-login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login or register using Google
 *     description: Logs user in with Google or creates a new verified account if email doesn't exist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - googleId
 *               - email
 *               - fullname
 *             properties:
 *               googleId:
 *                 type: string
 *               email:
 *                 type: string
 *               fullname:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google login successful
 *       400:
 *         description: Error logging in with Google
 */
router.post("/google-login", googleLoginValidationRules, validate, auth.googleLogin);


/**
 * @openapi
 * /auth/send-phone-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Send OTP to phone
 *     description: Updates phone number and sends SMS OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - phone
 *             properties:
 *               userId:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to phone
 *       400:
 *         description: Failed to send OTP
 */
router.post("/send-phone-otp", phoneOTPValidationRules, validate, auth.sendPhoneOTP);


/**
 * @openapi
 * /auth/verify-phone-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify phone OTP
 *     description: Confirms and marks phone number as verified.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phone verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-phone-otp", verifyPhoneOTPValidationRules, validate, auth.verifyPhoneOTP);


/**
 * @openapi
 * /auth/update-profile:
 *   put:
 *     tags:
 *       - Auth
 *     summary: Update user profile
 *     description: Updates firstName, lastName, phone, NIN, and avatar (base64 image uploaded to Cloudinary).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               nin:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 description: Base64 encoded image
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: User not found or invalid data
 */
router.put("/update-profile", updateProfileValidationRules, validate, auth.updateProfile);

router.post("/email_phone-availability",  auth.emailPhoneAvailability);




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
