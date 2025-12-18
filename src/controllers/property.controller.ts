import { Request, Response } from "express";
import * as propertyService from "../services/property.service";
import { prismaErrorHandler } from "../utils/prisimErrorHandler";

// Create Property
export async function createProperty(req: Request, res: Response) {
  try {
    const property = await propertyService.createProperty({
      sellerId: req.body.sellerId,
      title: req.body.title,
      imageSrc: req.body.imageSrc,
      bedrooms: req.body.bedrooms,
      rating: req.body.rating,
      sf: req.body.sf,
      reviews: req.body.reviews,
      price: req.body.price,
      location: req.body.location,
      views: req.body.views,
      overview: req.body.overview,
      about: req.body.about,
    });

    return res.json({ success: true, property });
  } catch (err: unknown) {
    // console.log(err)
    const message = err instanceof Error ? prismaErrorHandler(err) : "Unexpected error";
    return res.status(400).json({ error: message });
  }
}

// Update property
export async function updateProperty(req: Request, res: Response) {
  try {
    const property = await propertyService.updateProperty(req.params.id, req.body);
    res.json({ success: true, property });
  } catch (err: unknown) {
    const message = err instanceof Error ? prismaErrorHandler(err) : "Unexpected error";
    res.status(400).json({ error: message });
  }
}

// Delete property
export async function deleteProperty(req: Request, res: Response) {
  try {
    const property = await propertyService.deleteProperty(req.params.id);
    res.json({ success: true, message: "Property deleted", property });
  } catch (err: unknown) {
    const message = err instanceof Error ? prismaErrorHandler(err) : "Unexpected error";
    res.status(400).json({ error: message });
  }
}


// ---------------------------
// Get All Properties
// ---------------------------
export const getAllPropertiesController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { query = "", minPrice, maxPrice } = req.query;

    const properties = await propertyService.getAllProperties(userId, {
      query: query as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : 0,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : Infinity,
    });

    res.json({ success: true, properties });
  } catch (err: unknown) {
    const message = err instanceof Error ? prismaErrorHandler(err) : "Unexpected error";
    res.status(400).json({ error: message });
  }
};

// ---------------------------
// Get Property by ID
// ---------------------------
export const getPropertyByIdController = async (req: Request, res: Response) => {
  
  try {
    const userId = req.user?.id;
    const { id  } = req.params;
    const propertyId = id;
    if (!propertyId) throw new Error("propertyId is required");

    const property = await propertyService.getPropertyById(propertyId, userId);
    res.json({ success: true, property });
  } catch (err: unknown) {
    const message = err instanceof Error ? prismaErrorHandler(err) : "Property not found";
    res.status(404).json({ error: message });
  }
};

// ---------------------------
// Toggle Property (buy, wishlist, invest, rent)
// ---------------------------
export const togglePropertyController = async (req: Request, res: Response) => {
  
  try {
    const userId = req.user!.id;
    const { propertyId, action } = req.body;
    if (!propertyId) throw new Error("propertyId is required");

    if (!propertyId || !action) {
      return res.status(400).json({ success: false, message: "propertyId and action required" });
    }

    const property = await propertyService.toggleProperty(userId, propertyId, action);
    res.json({ success: true, property });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    res.status(400).json({ success: false, message });
  }
};



export const getUserDashboardPropertiesController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
        if (!userId) throw new Error("userId is required");


    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await propertyService.getUserPropertyTabs(userId);

    res.json({
      success: true,
      ...data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? prismaErrorHandler(err) : "Unexpected error";
    res.status(400).json({ success: false, message });
  }
};
