/**
 * @openapi
 * tags:
 *   name: Properties
 *   description: Property listing, management, and user interactions
 */

/**
 * @openapi
 * /api/properties:
 *   post:
 *     tags:
 *       - Properties
 *     summary: Create a new property
 *     description: >
 *       Creates a new property listing.
 *       Requires authentication and seller or admin privileges.
 *       Images must be base64-encoded and are uploaded to Cloudinary.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sellerId
 *               - title
 *               - imageSrc
 *               - bedrooms
 *               - sf
 *               - price
 *               - location
 *             properties:
 *               sellerId:
 *                 type: integer
 *                 example: 5
 *               title:
 *                 type: string
 *                 example: Modern 3 Bedroom Apartment
 *               imageSrc:
 *                 type: string
 *                 description: Base64-encoded main image
 *               views:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Base64-encoded gallery images
 *               bedrooms:
 *                 type: string
 *                 example: 3 Bedrooms
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               sf:
 *                 type: string
 *                 example: 1,200 sqft
 *               reviews:
 *                 type: integer
 *                 example: 24
 *               price:
 *                 type: string
 *                 example: ₦45,000,000
 *               location:
 *                 type: string
 *                 example: Lekki, Lagos
 *               overview:
 *                 type: object
 *               about:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Property created successfully
 *       400:
 *         description: Validation or upload error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @openapi
 * /api/properties:
 *   get:
 *     tags:
 *       - Properties
 *     summary: Get all properties
 *     description: >
 *       Retrieves all properties with optional filtering.
 *       If authenticated, returns user-specific status
 *       (isBought, isWishlisted, isInvested, isRented).
 *     parameters:
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *         example: Lekki
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *         example: 10
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *         example: 100
 *     responses:
 *       200:
 *         description: Properties fetched successfully
 */

/**
 * @openapi
 * /api/properties/{id}:
 *   get:
 *     tags:
 *       - Properties
 *     summary: Get property by ID
 *     description: >
 *       Retrieves a single property.
 *       If authenticated, includes user-specific interaction status.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *       404:
 *         description: Property not found
 */

/**
 * @openapi
 * /api/properties/{id}:
 *   put:
 *     tags:
 *       - Properties
 *     summary: Update a property
 *     description: >
 *       Updates property details and replaces images if provided.
 *       Requires seller or admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 */

/**
 * @openapi
 * /api/properties/{id}:
 *   delete:
 *     tags:
 *       - Properties
 *     summary: Delete a property
 *     description: >
 *       Deletes a property and all associated images from Cloudinary.
 *       Requires seller or admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 */

/**
 * @openapi
 * /api/properties/toggle:
 *   post:
 *     tags:
 *       - Properties
 *     summary: Toggle property action
 *     description: >
 *       Toggles a user interaction with a property.
 *       Acts as add/remove for:
 *       - bought
 *       - wishlist
 *       - invested
 *       - rented
 *       Buying a property updates its sale status.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - action
 *             properties:
 *               propertyId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [bought, wishlist, invested, rented]
 *     responses:
 *       200:
 *         description: Property action toggled successfully
 *       400:
 *         description: Invalid action or input
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/properties/dashboard/tabs:
 *   get:
 *     tags:
 *       - Properties
 *     summary: Get user dashboard property tabs
 *     description: >
 *       Returns all user-related property collections:
 *       - bought
 *       - wishlist
 *       - invested
 *       - rented
 *       - allProperties (merged and sorted by most recent activity)
 *       Each entry contains full property details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User dashboard properties retrieved successfully
 *       401:
 *         description: Unauthorized
 */
