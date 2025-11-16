// src/middleware/validators.ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// -----------------------
// Validation Rules
// -----------------------

export const registerValidationRules = [
  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),
  body("password")
    .exists({ checkFalsy: true }).withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("fullname")
    .exists({ checkFalsy: true }).withMessage("Full name is required")
    .isString().withMessage("Full name must be a string"),
];

export const loginValidationRules = [
  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),
  body("password")
    .exists({ checkFalsy: true }).withMessage("Password is required"),
];

export const verifyEmailValidationRules = [
  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),
  body("otp")
    .exists({ checkFalsy: true }).withMessage("OTP is required")
    .isLength({ min: 4, max: 6 }).withMessage("OTP must be 4-6 digits"),
];

export const forgotPasswordValidationRules = [
  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),
];

export const resetPasswordValidationRules = [
  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),
  body("otp")
    .exists({ checkFalsy: true }).withMessage("OTP is required")
    .isLength({ min: 4, max: 6 }).withMessage("OTP must be 4-6 digits"),
  body("newPassword")
    .exists({ checkFalsy: true }).withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
];

export const googleLoginValidationRules = [
  body("googleId").exists({ checkFalsy: true }).withMessage("Google ID is required"),
  body("email").exists({ checkFalsy: true }).withMessage("Email is required").isEmail(),
  body("fullname").exists({ checkFalsy: true }).withMessage("Fullname is required"),
];

export const phoneOTPValidationRules = [
  body("userId").exists({ checkFalsy: true }).withMessage("User ID is required"),
  body("phone").exists({ checkFalsy: true }).withMessage("Phone is required")
    .isMobilePhone("any").withMessage("Phone number is invalid"),
];

export const verifyPhoneOTPValidationRules = [
  body("userId").exists({ checkFalsy: true }).withMessage("User ID is required"),
  body("otp").exists({ checkFalsy: true }).withMessage("OTP is required")
    .isLength({ min: 4, max: 6 }).withMessage("OTP must be 4-6 digits"),
];

// -----------------------
// Middleware to check validation results
// -----------------------
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }
  next();
};
