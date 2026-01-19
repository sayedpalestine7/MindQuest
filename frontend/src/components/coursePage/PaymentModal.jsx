import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, CreditCard, Loader2 } from "lucide-react";

// Initialize Stripe with your publishable key from environment variable
// Get this from: https://dashboard.stripe.com/test/apikeys
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  "pk_test_51SrNkrLpbA7n68PCx8T1wV6pj8wDhMOWWD3p2aL7jH5BaApdEXvSIm1FP2Wjv7h1Bxm2Fjo1Mn2RYtqBrVUr3Pvk00o1M3yNRW"
);

/**
 * Payment Form Component - Handles Stripe payment confirmation
 */
function CheckoutForm({ amount, courseTitle, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js hasn't loaded yet
    }

    setProcessing(true);
    setError(null);

    try {
      // Confirm the payment with Stripe
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin, // Required but we handle success in-app
        },
        redirect: "if_required", // Stay on page instead of redirecting
      });

      if (submitError) {
        setError(submitError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful!
        console.log("✅ Payment succeeded:", paymentIntent.id);
        onSuccess(paymentIntent);
      } else {
        setError("Payment could not be completed. Please try again.");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-600 mb-1">You're enrolling in:</p>
        <p className="font-semibold text-gray-900">{courseTitle}</p>
        <p className="text-2xl font-bold text-blue-600 mt-2">${amount}</p>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white p-4 rounded-lg border border-gray-300">
        <PaymentElement />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ${amount}
            </>
          )}
        </button>
      </div>

      {/* Test Card Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800 font-semibold mb-1">🧪 Test Mode</p>
        <p className="text-xs text-yellow-700">
          Use card: <code className="bg-yellow-100 px-1 rounded">4242 4242 4242 4242</code>
          {" "}• Any future date • Any CVC
        </p>
      </div>
    </form>
  );
}

/**
 * Payment Modal Component - Main modal wrapper
 */
export default function PaymentModal({
  isOpen,
  onClose,
  clientSecret,
  amount,
  courseTitle,
  onSuccess,
}) {
  if (!isOpen || !clientSecret) return null;

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#2563eb",
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm
              amount={amount}
              courseTitle={courseTitle}
              onSuccess={onSuccess}
              onCancel={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}
