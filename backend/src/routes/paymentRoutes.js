import express from "express";
import { createPaymentIntent, handleWebhook } from "../controllers/paymentController.js";

const router = express.Router();

/**
 * POST /api/payments/create-intent
 * Create a Stripe PaymentIntent for course enrollment
 * Body: { courseId, studentId }
 * Returns: { clientSecret, amount }
 */
router.post("/create-intent", createPaymentIntent);

/**
 * POST /api/payments/webhook
 * Stripe webhook endpoint to verify payment success
 * (Optional but recommended for production)
 */
router.post("/webhook", handleWebhook);

export default router;
