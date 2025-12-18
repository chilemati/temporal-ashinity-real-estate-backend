import prisma from "../prismaClient";
import cloudinary from "../utils/cloudinary";

// Helper to extract Cloudinary public_id from URL
const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?([^/.]+)/);
  return match ? match[1] : null;
};

export const createProperty = async (data: {
  sellerId: number;
  title: string;
  imageSrc: string;      // main image (base64)
  views?: string[];      // gallery images (base64)
  bedrooms: string;
  rating?: number;
  sf: string;
  reviews?: number;
  price: string;
  location: string;
  overview?: object;
  about?: string[];
}) => {
  if (!data.imageSrc || !data.imageSrc.startsWith("data:image")) {
    throw new Error("Invalid main image. Must be a base64 string starting with 'data:image'.");
  }

  // Upload main image
  let mainUploadUrl: string;
  try {
    const mainUpload = await cloudinary.uploader.upload(data.imageSrc, {
      folder: "properties-ashinity",
    });
    mainUploadUrl = mainUpload.secure_url;
  } catch (err) {
    console.error("Main image upload failed", err);
    throw new Error("Failed to upload main image to Cloudinary");
  }

  // Upload gallery images (views)
  const uploadedViews: string[] = [];
  if (data.views && data.views.length > 0) {
    for (const img of data.views.filter(v => v && v.startsWith("data:image"))) {
      try {
        const upload = await cloudinary.uploader.upload(img, {
          folder: "properties-ashinity/views",
        });
        uploadedViews.push(upload.secure_url);
      } catch (err) {
        console.warn("Skipping invalid gallery image", err);
      }
    }
  }

  // Save property to database
  return prisma.property.create({
    data: {
      sellerId: data.sellerId,
      title: data.title,
      imageSrc: mainUploadUrl,
      bedrooms: data.bedrooms,
      rating: data.rating ?? 0,
      sf: data.sf,
      reviews: data.reviews ?? 0,
      price: data.price,
      location: data.location,
      views: uploadedViews,
      overview: data.overview ?? {},
      about: data.about ?? [],
    },
  });
};


// ---------------------------
// Update Property
// ---------------------------
export const updateProperty = async (
  id: string,
  data: {
    title?: string;
    bedrooms?: string;
    rating?: number;
    sf?: string;
    reviews?: number;
    price?: string;
    location?: string;
    overview?: object;
    about?: string[];
    imageSrc?: string; // new main image (base64)
    views?: string[];  // new gallery images (base64)
  }
) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new Error("Property not found");

  const updateData: any = { ...data };

  // Replace main image if provided
  if (data.imageSrc && data.imageSrc.startsWith("data:image")) {
    // Delete old main image from Cloudinary
    const oldMainId = extractPublicId(property.imageSrc);
    if (oldMainId) await cloudinary.uploader.destroy(`properties-ashinity/${oldMainId}`);

    // Upload new main image
    const upload = await cloudinary.uploader.upload(data.imageSrc, {
      folder: "properties-ashinity",
    });
    updateData.imageSrc = upload.secure_url;
  }

  // Replace gallery images if provided
  if (data.views && data.views.length > 0) {
    // Delete old gallery images
    for (const viewUrl of property.views) {
      const viewId = extractPublicId(viewUrl);
      if (viewId) await cloudinary.uploader.destroy(`properties-ashinity/views/${viewId}`);
    }

    // Upload new gallery images
    const uploadedViews: string[] = [];
    for (const img of data.views.filter(v => !!v && v.startsWith("data:image"))) {
      try {
        const upload = await cloudinary.uploader.upload(img, {
          folder: "properties-ashinity/views",
        });
        uploadedViews.push(upload.secure_url);
      } catch (err) {
        console.warn("Skipping invalid gallery image", err);
      }
    }
    updateData.views = uploadedViews;
  }

  return prisma.property.update({
    where: { id },
    data: updateData,
  });
};

// ---------------------------
// Delete Property
// ---------------------------
export const deleteProperty = async (id: string) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new Error("Property not found");

  // Delete main image
  const mainId = extractPublicId(property.imageSrc);
  if (mainId) await cloudinary.uploader.destroy(`properties-ashinity/${mainId}`);

  // Delete gallery images
  for (const viewUrl of property.views) {
    const viewId = extractPublicId(viewUrl);
    if (viewId) await cloudinary.uploader.destroy(`properties-ashinity/views/${viewId}`);
  }

  return prisma.property.delete({ where: { id } });
};



type ToggleAction = "bought" | "wishlist" | "invested" | "rented";

// Map action -> prisma model (type-safe)
const getModelForAction = (action: ToggleAction) => {
  switch (action) {
    case "bought":
      return prisma.boughtProperty;
    case "wishlist":
      return prisma.wishlistProperty;
    case "invested":
      return prisma.investedProperty;
    case "rented":
      return prisma.rentedProperty;
  }
};

// ---------------------------
// Toggle Property Actions
// ---------------------------
export const toggleProperty = async (
  userId: number,
  propertyId: string,
  action: ToggleAction
) => {
  switch (action) {
    case "bought": {
      const existing = await prisma.boughtProperty.findUnique({
        where: { userId_propertyId: { userId, propertyId } },
      });
      if (existing) {
        await prisma.boughtProperty.delete({ where: { userId_propertyId: { userId, propertyId } } });
        await prisma.property.update({
          where: { id: propertyId },
          data: { saleStatus: "AVAILABLE" },
        });
      } else {
        await prisma.boughtProperty.create({ data: { userId, propertyId } });
        await prisma.property.update({
          where: { id: propertyId },
          data: { saleStatus: "SOLD" },
        });
      }
      break;
    }

    case "wishlist": {
      const existing = await prisma.wishlistProperty.findUnique({
        where: { userId_propertyId: { userId, propertyId } },
      });
      if (existing) {
        await prisma.wishlistProperty.delete({ where: { userId_propertyId: { userId, propertyId } } });
      } else {
        await prisma.wishlistProperty.create({ data: { userId, propertyId } });
      }
      break;
    }

    case "invested": {
      const existing = await prisma.investedProperty.findUnique({
        where: { userId_propertyId: { userId, propertyId } },
      });
      if (existing) {
        await prisma.investedProperty.delete({ where: { userId_propertyId: { userId, propertyId } } });
      } else {
        await prisma.investedProperty.create({ data: { userId, propertyId } });
      }
      break;
    }

    case "rented": {
      const existing = await prisma.rentedProperty.findUnique({
        where: { userId_propertyId: { userId, propertyId } },
      });
      if (existing) {
        await prisma.rentedProperty.delete({ where: { userId_propertyId: { userId, propertyId } } });
      } else {
        await prisma.rentedProperty.create({ data: { userId, propertyId } });
      }
      break;
    }

    default:
      throw new Error("Invalid action");
  }

  // Return property with user status
  return getPropertyById(propertyId, userId);
};


// ---------------------------
// Get Property by ID (with user-specific status)
// ---------------------------
export const getPropertyById = async (propertyId: string, userId?: number) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { seller: true },
  });
  if (!property) throw new Error("Property not found");

  if (!userId) return { ...property, userStatus: {} };

  const [bought, wishlist, invested, rented] = await Promise.all([
    prisma.boughtProperty.findUnique({ where: { userId_propertyId: { userId, propertyId } } }),
    prisma.wishlistProperty.findUnique({ where: { userId_propertyId: { userId, propertyId } } }),
    prisma.investedProperty.findUnique({ where: { userId_propertyId: { userId, propertyId } } }),
    prisma.rentedProperty.findUnique({ where: { userId_propertyId: { userId, propertyId } } }),
  ]);

  return {
    ...property,
    userStatus: {
      isBought: !!bought,
      isWishlisted: !!wishlist,
      isInvested: !!invested,
      isRented: !!rented,
    },
  };
};

// ---------------------------
// Get All Properties
// ---------------------------
export const getAllProperties = async (
  userId?: number,
  options?: { query?: string; minPrice?: number; maxPrice?: number }
) => {
  const { query = "", minPrice = 0, maxPrice = Infinity } = options || {};

  const properties = await prisma.property.findMany({ include: { seller: true } });

  const filtered = properties.filter((p) => {
    const matchesQuery =
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.location.toLowerCase().includes(query.toLowerCase()) ||
      p.bedrooms.toLowerCase().includes(query.toLowerCase());

    const priceNumber = parseInt(p.price.replace(/[^0-9]/g, "")) / 1_000_000;
    return matchesQuery && priceNumber >= minPrice && priceNumber <= maxPrice;
  });

  if (!userId) return filtered.map(p => ({ ...p, userStatus: {} }));

  return Promise.all(filtered.map(p => getPropertyById(p.id, userId)));
};


export const getUserPropertyTabs = async (userId: number) => {
  // Fetch all relations with full Property included
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bought: {
        orderBy: { createdAt: "desc" },
        include: { property: { include: { seller: true } } },
      },
      wishlist: {
        orderBy: { createdAt: "desc" },
        include: { property: { include: { seller: true } } },
      },
      invested: {
        orderBy: { createdAt: "desc" },
        include: { property: { include: { seller: true } } },
      },
      rented: {
        orderBy: { createdAt: "desc" },
        include: { property: { include: { seller: true } } },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Extract only properties
  const bought = user.bought.map(b => ({
    ...b.property,
    _activityAt: b.createdAt,
    _type: "bought",
  }));

  const wishlist = user.wishlist.map(w => ({
    ...w.property,
    _activityAt: w.createdAt,
    _type: "wishlist",
  }));

  const invested = user.invested.map(i => ({
    ...i.property,
    _activityAt: i.createdAt,
    _type: "invested",
  }));

  const rented = user.rented.map(r => ({
    ...r.property,
    _activityAt: r.createdAt,
    _type: "rented",
  }));

  // Merge all properties, most recent activity first
  const allProperties = [...bought, ...wishlist, ...invested, ...rented].sort(
    (a, b) => b._activityAt.getTime() - a._activityAt.getTime()
  );

  return {
    bought,
    wishlist,
    invested,
    rented,
    allProperties,
  };
};

