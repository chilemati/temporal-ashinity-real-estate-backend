import { body, ValidationError, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// -----------------------
// VALIDATION RULES
// -----------------------

// REGISTER — now requires ONLY email
export const registerValidationRules = [
  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),
];

// LOGIN — password is OPTIONAL
export const loginValidationRules = [
  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),

  body("password")
    .optional()  // allow OTP-only login
    .isString().withMessage("Password must be a string"),
];

// VERIFY EMAIL OTP
export const verifyEmailValidationRules = [
  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),

  body("otp")
    .exists({ checkFalsy: true }).withMessage("OTP is required")
    .isLength({ min: 4, max: 6 }).withMessage("OTP must be 4-6 digits"),
];

// update user
export const updateProfileValidationRules = [
  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),
];

// FORGOT PASSWORD
export const forgotPasswordValidationRules = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),
];

// RESET PASSWORD
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

// GOOGLE LOGIN
export const googleLoginValidationRules = [
  body("googleId")
    .exists({ checkFalsy: true }).withMessage("Google ID is required"),

  body("email")
    .exists({ checkFalsy: true }).withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),

  body("fullname")
    .exists({ checkFalsy: true }).withMessage("Fullname is required"),
];

// SEND PHONE OTP
export const phoneOTPValidationRules = [
  body("userId")
    .exists({ checkFalsy: true }).withMessage("User ID is required"),

  body("phone")
    .exists({ checkFalsy: true }).withMessage("Phone is required")
    .isMobilePhone("any").withMessage("Phone number is invalid"),
];

// VERIFY PHONE OTP
export const verifyPhoneOTPValidationRules = [
  body("userId")
    .exists({ checkFalsy: true }).withMessage("User ID is required"),

  body("otp")
    .exists({ checkFalsy: true }).withMessage("OTP is required")
    .isLength({ min: 4, max: 6 }).withMessage("OTP must be 4-6 digits"),
];

// -----------------------
// VALIDATION RESULT HANDLER
// -----------------------
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err: ValidationError) => err.msg),
    });
  }
  next();
};
