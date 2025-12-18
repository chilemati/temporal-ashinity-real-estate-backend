/**
 * @openapi
 * tags:
 *   name: Admin
 *   description: Administrative and super-administrative operations
 */

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Fetch all users
 *     description: >
 *       Retrieves a list of all registered users in the system.
 *       Results are ordered by most recently created users first.
 *       Accessible only by Admin and SuperAdmin roles.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   email:
 *                     type: string
 *                     example: user@example.com
 *                   role:
 *                     type: string
 *                     enum: [normal, seller, admin, superadmin]
 *                   kycStatus:
 *                     type: string
 *                     example: VERIFIED
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – insufficient permissions
 */

/**
 * @openapi
 * /api/admin/user/{userId}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a user account
 *     description: >
 *       Permanently removes a user from the system.
 *       Accessible by Admin and SuperAdmin roles.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – insufficient permissions
 *       404:
 *         description: User not found
 */

/**
 * @openapi
 * /api/admin/suspend/{userId}:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Suspend a user account
 *     description: >
 *       Suspends a user by setting their KYC status to SUSPENDED.
 *       Suspended users are restricted from platform activities.
 *       Accessible by Admin and SuperAdmin roles.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     responses:
 *       200:
 *         description: User suspended successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – insufficient permissions
 *       404:
 *         description: User not found
 */

/**
 * @openapi
 * /api/admin/promote:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Promote a user role
 *     description: >
 *       Promotes a user to a higher role.
 *       This operation is restricted to SuperAdmin users only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newRole
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 10
 *               newRole:
 *                 type: string
 *                 enum: [seller, admin, superadmin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – SuperAdmin access required
 */

/**
 * @openapi
 * /api/admin/demote:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Demote a user role
 *     description: >
 *       Demotes a user to a lower role.
 *       This operation is restricted to SuperAdmin users only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newRole
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 10
 *               newRole:
 *                 type: string
 *                 enum: [normal, seller, admin]
 *                 example: normal
 *     responses:
 *       200:
 *         description: User demoted successfully
 *       400:
 *         description: Invalid role provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – SuperAdmin access required
 */
