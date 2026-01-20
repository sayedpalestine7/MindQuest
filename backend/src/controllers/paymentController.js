import Course from "../models/mongo/courseModel.js";
import { stripe } from "../server.js";
import { createNotification } from "../services/notificationService.js";

/**
 * Create a Stripe PaymentIntent for course enrollment
 * 
 * Security: Amount is calculated from database, never trusted from client
 * 
 * @route POST /api/payments/create-intent
 * @body { courseId, studentId }
 * @returns { success, clientSecret, amount, courseTitle }
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;

    // Validate required fields
    if (!courseId || !studentId) {
      return res.status(400).json({
        success: false,
        error: "courseId and studentId are required",
      });
    }

    // Fetch course from database to get actual price
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Get price from database (source of truth)
    const price = Number(course.price) || 0;

    // If course is free, no payment needed
    if (price === 0) {
      return res.status(400).json({
        success: false,
        error: "This course is free. No payment required.",
      });
    }

    // Validate price is reasonable
    if (price < 1) {
      return res.status(400).json({
        success: false,
        error: "Invalid course price",
      });
    }

    // Stripe expects amount in cents (smallest currency unit)
    const amountInCents = Math.round(price * 100);

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      // Store metadata for webhook verification and enrollment
      metadata: {
        courseId: courseId.toString(),
        studentId: studentId.toString(),
        courseTitle: course.title,
      },
      // Optional: Add description for Stripe dashboard
      description: `Enrollment: ${course.title}`,
    });

    console.log("✅ PaymentIntent created:", paymentIntent.id, "Amount:", `$${price}`);

    // Return clientSecret to frontend (safe to expose)
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: price, // In dollars for display
      courseTitle: course.title,
    });

  } catch (error) {
    console.error("❌ Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create payment intent",
    });
  }
};

/**
 * Stripe Webhook Handler - Verify payment success
 * 
 * This endpoint is called by Stripe when payment status changes
 * Use this to verify payment before allowing enrollment
 * 
 * @route POST /api/payments/webhook
 * @body Raw Stripe webhook event (req.rawBody)
 * @returns 200 OK or 400 Bad Request
 */
export const handleWebhook = async (req, res) => {
  try {
    // Get Stripe signature from headers
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // If webhook secret is not configured, log warning but continue
    if (!webhookSecret) {
      console.warn("⚠️ STRIPE_WEBHOOK_SECRET not configured. Webhook verification skipped.");
      return res.status(200).json({ received: true });
    }

    let event;

    try {
      // Verify webhook signature (requires raw body)
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).json({
        success: false,
        error: `Webhook Error: ${err.message}`,
      });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log("✅ Payment succeeded:", paymentIntent.id);
        console.log("   Course ID:", paymentIntent.metadata.courseId);
        console.log("   Student ID:", paymentIntent.metadata.studentId);
        
        // Send notification to student
        if (paymentIntent.metadata.studentId && paymentIntent.metadata.courseId) {
          await createNotification({
            recipientId: paymentIntent.metadata.studentId,
            type: "payment",
            title: "Payment Successful",
            message: `Your payment for "${paymentIntent.metadata.courseTitle}" was successful.`,
            entityId: paymentIntent.metadata.courseId,
            metadata: { 
              courseName: paymentIntent.metadata.courseTitle,
              amount: paymentIntent.amount / 100
            }
          });
        }
        
        // Here you could automatically enroll the student
        // For now, we'll rely on frontend confirmation
        // In production, you'd want to:
        // 1. Verify payment status
        // 2. Enroll student in course
        // 3. Send confirmation email
        
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        console.log("❌ Payment failed:", failedIntent.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    res.status(200).json({ received: true });

  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({
      success: false,
      error: "Webhook processing failed",
    });
  }
};
