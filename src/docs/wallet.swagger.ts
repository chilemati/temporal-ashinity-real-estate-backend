/**
 * @openapi
 * tags:
 *   name: Wallet
 *   description: Operations related to user wallets and transactions
 */

/**
 * @openapi
 * /api/wallet/fund:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Fund user wallet
 *     description: >
 *       Initializes a funding transaction via Paystack.
 *       Requires user's email and amount. Minimum funding amount is ₦500.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - email
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Funding initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 authorizationUrl:
 *                   type: string
 *                   example: https://paystack.com/authorization_url
 *                 reference:
 *                   type: string
 *                   example: FUND_1675123456789_1
 *       400:
 *         description: Validation error or wallet not found
 */

/**
 * @openapi
 * /api/wallet/withdraw:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Withdraw from user wallet
 *     description: >
 *       Initiates a withdrawal transaction via Paystack.
 *       Requires the amount and an authenticated user with linked bank account.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Withdrawal initiated successfully
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
 *                   example: Withdrawal initiated
 *                 transaction:
 *                   type: object
 *                 paystackData:
 *                   type: object
 *       400:
 *         description: Validation error, insufficient balance, or bank account not linked
 */

/**
 * @openapi
 * /api/wallet:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get user wallet and transactions
 *     description: >
 *       Retrieves the authenticated user's wallet details and transaction history.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 wallet:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     balance:
 *                       type: number
 *                       example: 1500
 *                     currency:
 *                       type: string
 *                       example: NGN
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           type:
 *                             type: string
 *                             enum: [FUND, WITHDRAW]
 *                             example: FUND
 *                           amount:
 *                             type: number
 *                             example: 1000
 *                           reference:
 *                             type: string
 *                             example: FUND_1675123456789_1
 *                           status:
 *                             type: string
 *                             enum: [PENDING, SUCCESS, FAILED]
 *                             example: SUCCESS
 *                           paystackRef:
 *                             type: string
 *                             nullable: true
 *                           channel:
 *                             type: string
 *                             nullable: true
 *                           metadata:
 *                             type: object
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Wallet not found
 */

/**
 * @openapi
 * /api/wallet/paystack/webhook:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Paystack webhook endpoint
 *     description: >
 *       Handles Paystack events for funding and withdrawals.
 *       Verifies signature using PAYSTACK_SECRET_KEY.
 *       Processes `charge.success`, `transfer.success`, and `transfer.failed` events.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event processed successfully
 *       401:
 *         description: Invalid signature
 *       500:
 *         description: Internal server error
 */
