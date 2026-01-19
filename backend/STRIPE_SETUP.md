# Stripe Setup Instructions

## Step 1: Get Your Stripe Test Secret Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Copy your **Secret key** (starts with `sk_test_...`)

## Step 2: Add to .env File

Open `backend/.env` and replace the placeholder:

```env
STRIPE_SECRET_KEY=sk_test_your_actual_test_key_here
```

## Step 3: Verify Setup

The backend server will automatically:
- Initialize Stripe with your secret key
- Register payment routes at `/api/payments`
- Export `stripe` for use in payment controller

## Available Endpoints (After Step 2 Implementation)

- `POST /api/payments/create-intent` - Create PaymentIntent for course enrollment
- `POST /api/payments/webhook` - Stripe webhook for payment verification

## Security Notes

✅ Secret key stays on backend only  
✅ Never expose in frontend code  
✅ Test mode keys are safe for development  
✅ Amount calculated from course price in database  

## Next Steps

After adding your Stripe key:
1. Restart the backend server: `npm run dev`
2. Proceed to **Step 2** for PaymentIntent controller implementation
