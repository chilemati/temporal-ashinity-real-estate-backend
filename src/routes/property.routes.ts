import express from "express";
import * as property from "../controllers/property.controller";
import { body, param } from "express-validator";
import { validate } from "../middleware/validate";
import {
  propertyValidationRules,
  validateProperty,
} from "../middleware/property.validation";
import { authMiddleware, isSellerOrAdmin } from "../middleware/auth.middleware";

const router = express.Router();

// CREATE
router.post(
  "/",
  propertyValidationRules,
  validateProperty,
  authMiddleware,
  isSellerOrAdmin,
  property.createProperty
);

// READ ALL
router.get("/", property.getAllPropertiesController);

// READ ONE
router.get(
  "/:id",
  [param("id").exists().isString()],
  validateProperty,
  property.getPropertyByIdController
);

// UPDATE
router.put(
  "/:id",
  [param("id").exists().isString()],
  validateProperty,
  authMiddleware,
  isSellerOrAdmin,
  property.updateProperty
);

// DELETE
router.delete(
  "/:id",
  [param("id").exists().isString()],
  validateProperty,
  authMiddleware,
  isSellerOrAdmin,
  property.deleteProperty
);

// Toggle actions: buy, wishlist, invest, rent
router.post("/toggle", authMiddleware, property.togglePropertyController);

/**
 * User dashboard tabs:
 * - bought
 * - wishlist
 * - invested
 * - rented
 * - allProperties (merged, most recent first)
 */
router.get("/dashboard/tabs", authMiddleware, property.getUserDashboardPropertiesController);




export default router;
