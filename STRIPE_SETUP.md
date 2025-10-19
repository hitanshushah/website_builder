# Stripe Integration Setup

This document explains how to set up Stripe integration for your website builder pricing plans.

## Environment Variables

Add these environment variables to your `.env` file:

```bash
# Stripe Configuration (server-side)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Option 1: Use Price IDs (recommended)
# Note: Basic plan is free, so no Stripe configuration needed
STRIPE_PLUS_PRICE_ID=price_plus_plan_id
STRIPE_PRO_PRICE_ID=price_pro_plan_id

# Option 2: Use Product IDs (will auto-fetch first price)
# Note: Basic plan is free, so no Stripe configuration needed
STRIPE_PLUS_PRODUCT_ID=prod_plus_plan_id
STRIPE_PRO_PRODUCT_ID=prod_pro_plan_id

# Base URL for redirects (public config)
BASE_URL=http://localhost:3000
```

### Getting Your Product/Price IDs

If you already have Stripe products, run this script to get your IDs:

```bash
STRIPE_SECRET_KEY=sk_test_... node scripts/get-stripe-products.js
```

## Stripe Dashboard Setup

1. **Create Products and Prices:**
   - Go to your Stripe Dashboard → Products
   - Create products for each plan (Basic, Plus, Pro)
   - Create recurring prices for each product (monthly billing)
   - Copy the price IDs and add them to your environment variables

2. **Set up Webhooks:**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe-webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook secret and add it to your environment variables

## Local Development with Stripe CLI

For local development, use the Stripe CLI to forward webhooks to your local server:

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Start webhook forwarding:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

4. **Get the webhook signing secret:**
   ```bash
   stripe listen --print-secret
   ```

5. **Update your .env file:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_cli_webhook_secret_here
   ```

6. **Start your development server:**
   ```bash
   npm run dev
   ```

The Stripe CLI will now forward all webhook events to your local server, allowing you to test webhook handling without deploying to production.

## API Endpoints

- `POST /api/create-checkout-session` - Creates a Stripe checkout session
- `POST /api/stripe-webhook` - Handles Stripe webhook events

## How It Works

1. User clicks "Upgrade" on a plan in the pricing page
2. Frontend calls `/api/create-checkout-session` with plan details
3. Server creates Stripe checkout session and returns checkout URL
4. User completes payment on Stripe's secure checkout page
5. Stripe sends webhook to `/api/stripe-webhook`
6. Webhook handler updates user's plan in the database
7. User is redirected back to pricing page with success message

## Testing

Use Stripe's test mode with test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## Production Deployment

1. Switch to live mode in Stripe Dashboard
2. Update environment variables with live keys
3. Update webhook endpoint to production URL
4. Test with real payment methods
