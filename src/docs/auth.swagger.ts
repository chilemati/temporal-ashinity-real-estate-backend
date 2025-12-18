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

/**
 * @openapi
 * /api/auth/email_phone-availability:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Check email and phone availability
 *     description: >
 *       Validates whether an email address and phone number are available for registration.
 *       This endpoint ensures the email and phone number are not already associated with an existing user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *     responses:
 *       200:
 *         description: Email and phone number are available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email and phone number available
 *       400:
 *         description: Email or phone number already in use, or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email already registered
 */
