import express, { Request, Response } from "express";
import * as auth from "../controllers/auth.controller";
import {
  registerValidationRules,
  loginValidationRules,
  verifyEmailValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  googleLoginValidationRules,
  phoneOTPValidationRules,
  verifyPhoneOTPValidationRules,
  validate
} from "../middleware/validate";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


 /**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user and send OTP to email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullname
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullname:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: Email already registered or validation error
 */

router.post("/register", registerValidationRules, validate, auth.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login a user and return authentication token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully, returns JWT token and user data
 *       400:
 *         description: Invalid credentials or email not verified
 */

router.post("/login", loginValidationRules, validate, auth.login);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify user email using OTP sent to email
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
 *     summary: Send OTP to email for password reset
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
 *         description: OTP sent to email
 *       400:
 *         description: User not found
 */

router.post("/forgot-password", forgotPasswordValidationRules, validate, auth.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password using OTP sent to email
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
 *         description: Password reset successfully
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
 *     summary: Login or register a user using Google OAuth
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
 *         description: Authentication successful
 *       400:
 *         description: Google login failed
 */

router.post("/google-login", googleLoginValidationRules, validate, auth.googleLogin);

/**
 * @openapi
 * /auth/send-phone-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Send OTP to user's phone number for verification
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
 *         description: Invalid phone or user not found
 */

router.post("/send-phone-otp", phoneOTPValidationRules, validate, auth.sendPhoneOTP);

/**
 * @openapi
 * /auth/verify-phone-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify phone number with OTP sent via SMS
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





router.patch(
  "/update-user-profile/:id",
  upload.single("image"),   // <-- THIS IS THE FIX
  async (req: Request, res: Response) => {
    try {
      const bodyRaw = { ...req.body };
      const bodyParsed: any = { ...req.body };

      if (typeof bodyParsed.address === "string") {
        try {
          bodyParsed.address = JSON.parse(bodyParsed.address);
        } catch {}
      }

      if (typeof bodyParsed.skills === "string") {
        try {
          bodyParsed.skills = JSON.parse(bodyParsed.skills);
        } catch {}
      }

      if (req.file) {
        bodyParsed.image = req.file;
      }

      return res.json({
        success: false,
        message: "Received data from frontend",
        body: bodyParsed,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);



export default router;
