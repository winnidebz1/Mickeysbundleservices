# Quick Start: API Configuration

## What You Need

1. **Moolre API Key** - Get this from your Moolre account
2. **Bundle Provider API** - Access to a data bundle reseller
3. **Vercel Account** - For deployment

## Setup Steps (5 minutes)

### 1. Get Moolre API Key
- Go to https://moolre.com
- Sign up or log in
- Navigate to Settings → API Keys
- Copy your API key

### 2. Configure Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `MOOLRE_API_KEY` | Your Moolre API key | `mk_live_abc123...` |
| `ADMIN_WEBHOOK_URL` | Your webhook URL | `https://your-site.vercel.app/api/webhook` |
| `BUNDLE_API_KEY` | Your bundle provider key | `bp_abc123...` |
| `BUNDLE_API_URL` | Bundle provider endpoint | `https://api.provider.com/deliver` |

### 3. Set Up Moolre Webhook

In your Moolre dashboard:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-site.vercel.app/api/webhook`
3. Select events: Payment Success, Payment Failed

### 4. Update Bundle Delivery Code

Edit `api/webhook.js` and update the `deliverBundle` function with your bundle provider's API details.

### 5. Test It!

1. Make a small test purchase (GH₵ 1)
2. Check Vercel logs: `vercel logs --follow`
3. Verify payment in Moolre dashboard
4. Confirm bundle delivery

## Current API Status

✅ Payment initiation endpoint ready (`/api/create-payment`)
✅ Webhook handler ready (`/api/webhook`)
✅ Separate payment/recipient number support
✅ Transaction reference generation
⚠️ Bundle delivery needs your provider's API details
⚠️ Database storage (optional) - not yet implemented

## What Happens When a Customer Buys

1. Customer selects bundle and enters phone numbers
2. Frontend calls `/api/create-payment`
3. API initiates Moolre payment request
4. Customer approves payment on their phone
5. Moolre sends webhook to `/api/webhook`
6. Webhook triggers bundle delivery
7. Customer receives data bundle

## Need Help?

Read the full guide: `API_SETUP.md`

## Important Security Notes

⚠️ **NEVER** commit your `.env` file to git
⚠️ **ALWAYS** use environment variables for API keys
⚠️ **TEST** with small amounts before going live
