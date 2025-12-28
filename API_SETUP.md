# API Setup Guide

## Overview
This guide will help you set up the payment and bundle delivery APIs for Mickey's Bundle Services.

## Prerequisites
1. **Moolre Account**: Sign up at [Moolre](https://moolre.com) to get your API key
2. **Bundle Provider API**: Access to a data bundle reseller API (MTN, AirtelTigo, etc.)
3. **Vercel Account**: For deployment (or any serverless platform)

## Step 1: Get Your Moolre API Key

1. Sign up or log in to your Moolre account
2. Navigate to **Settings** → **API Keys**
3. Generate a new API key for production
4. Copy the API key (you'll need it in Step 3)

## Step 2: Set Up Bundle Delivery Provider

You'll need access to a data bundle reseller API. Common options:
- **Hubtel** (Ghana)
- **Direct carrier APIs** (MTN, AirtelTigo)
- **Other reseller platforms**

Get your API credentials from your chosen provider.

## Step 3: Configure Environment Variables

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```bash
# Get these from Moolre Dashboard > Settings
MOOLRE_API_KEY=your_public_api_key
MOOLRE_API_USER=your_moolre_username
MOOLRE_ACCOUNT_NUMBER=your_moolre_wallet_number

ADMIN_WEBHOOK_URL=https://your-domain.vercel.app/api/webhook
BUNDLE_API_KEY=your_bundle_provider_api_key
BUNDLE_API_URL=https://api.your-bundle-provider.com/deliver
```

### For Local Development:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your actual API keys

3. **IMPORTANT**: Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 4: Configure Moolre Webhook

1. Log in to your Moolre dashboard
2. Go to **Settings** → **Webhooks**
3. Add your webhook URL:
   ```
   https://your-domain.vercel.app/api/webhook
   ```
4. Select events to receive:
   - ✅ Payment Success
   - ✅ Payment Failed
   - ✅ Payment Pending

## Step 5: Update Bundle Delivery Logic

Edit `api/webhook.js` and update the `deliverBundle` function with your actual bundle provider's API:

```javascript
async function deliverBundle({ network, bundle, recipientPhone, transactionRef }) {
    const BUNDLE_API_KEY = process.env.BUNDLE_API_KEY;
    const BUNDLE_API_URL = process.env.BUNDLE_API_URL;

    const response = await fetch(BUNDLE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BUNDLE_API_KEY}`
        },
        body: JSON.stringify({
            network: network,
            bundle: bundle,
            phone: recipientPhone,
            reference: transactionRef
        })
    });

    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(`Bundle delivery failed: ${result.message}`);
    }
    
    return result;
}
```

## Step 6: Test the Integration

### Test Payment Flow:

1. Open your website
2. Select a network and bundle
3. Enter test phone numbers
4. Complete the payment with a small amount (e.g., GH₵ 1)
5. Check the Vercel logs to see if the payment was initiated
6. Check if the webhook received the confirmation

### View Logs:

**Vercel:**
```bash
vercel logs --follow
```

Or view in the Vercel dashboard under **Deployments** → **Functions**

## Step 7: Monitor Transactions

Add logging and monitoring:

1. **Vercel Logs**: Check function logs in the Vercel dashboard
2. **Moolre Dashboard**: Monitor payments in your Moolre account
3. **Error Tracking**: Consider adding Sentry or similar for error tracking

## API Endpoints

### POST /api/create-payment
Initiates a mobile money payment

**Request Body:**
```json
{
  "paymentPhone": "0241234567",
  "recipientPhone": "0241234567",
  "network": "mtn",
  "amount": 6.50,
  "bundle": "1GB"
}
```

**Response:**
```json
{
  "success": true,
  "transactionRef": "MBS-1234567890-abc123",
  "message": "Payment initiated successfully"
}
```

### POST /api/webhook
Receives payment confirmations from Moolre (called automatically)

## Troubleshooting

### Payment Not Initiating / Server Configuration Error
- **Error: "Server configuration error"**: This means `MOOLRE_API_KEY` is missing.
  1. Create a file named `.env.local` in the project root.
  2. Add: `MOOLRE_API_KEY=your_actual_key`
  3. Restart your local server.
- Verify phone number format (should be 10 digits starting with 0)
- Check Vercel function logs for errors

### Webhook Not Receiving Events
- Verify webhook URL in Moolre dashboard
- Check if URL is publicly accessible
- Ensure webhook endpoint returns 200 status

### Bundle Not Delivered
- Check if `deliverBundle` function is properly implemented
- Verify bundle provider API credentials
- Check function logs for delivery errors

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Validate webhook signatures** (implement in `api/webhook.js`)
3. **Use HTTPS** for all API communications
4. **Rate limit** your API endpoints
5. **Log all transactions** for audit purposes

## Next Steps

1. Set up a database to store transaction history
2. Implement admin dashboard to view transactions
3. Add email/SMS notifications for customers
4. Set up automated retry for failed bundle deliveries
5. Implement refund handling for failed payments

## Support

For issues with:
- **Moolre API**: Contact Moolre support
- **Bundle Delivery**: Contact your bundle provider
- **This Application**: Check the code or contact your developer

## Important Notes

⚠️ **Test thoroughly** before going live with real money
⚠️ **Keep API keys secure** and rotate them regularly
⚠️ **Monitor transactions** daily to catch issues early
⚠️ **Have a backup plan** for when APIs are down
