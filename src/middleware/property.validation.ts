import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const propertyValidationRules = [
  body("title").exists({ checkFalsy: true }).withMessage("Title is required"),
  body("imageSrc").exists({ checkFalsy: true }).withMessage("Image URL is required"),
  body("bedrooms").exists({ checkFalsy: true }).withMessage("Bedrooms info is required"),
  body("sf").exists({ checkFalsy: true }).withMessage("Square footage is required"),
  body("price").exists({ checkFalsy: true }).withMessage("Price is required"),
  body("location").exists({ checkFalsy: true }).withMessage("Location is required"),
  body("overview").exists({ checkFalsy: true }).withMessage("Overview is required"),
  body("about").isArray().withMessage("About must be an array of strings"),
];

export const validateProperty = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  next();
};
