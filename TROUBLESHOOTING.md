# Troubleshooting: Orders Not Appearing in Admin Dashboard

## Issue
Payments are being made but orders are not appearing in the admin dashboard.

## Diagnostic Steps

### 1. Check Vercel Logs
The most important step is to check your Vercel deployment logs:

1. Go to https://vercel.com/dashboard
2. Select your project (Mickeysbundleservices)
3. Click on "Logs" or "Functions"
4. Look for webhook calls and API requests

### 2. What to Look For in Logs

#### Webhook Logs
Look for these log messages when a payment is made:

**Paystack Webhook:**
- `🔔 Webhook received: POST`
- `📨 Webhook event: charge.success`
- `💰 Processing successful charge: [reference]`
- `📦 Order created: {...}`
- `🔄 Syncing order to: [url]`
- `✅ Order sync response: {...}`

**Moolre Webhook:**
- `🔔 Moolre Webhook received: POST`
- `📨 Received Moolre Webhook: {...}`
- `✅ Moolre Payment Successful: [reference]`
- `📦 Order created: {...}`
- `🔄 Syncing order to: [url]`
- `✅ Order synced to admin dashboard: {...}`

#### Orders API Logs
- `📊 GET /api/orders - Returning X orders`
- `📝 POST /api/orders - Action: add`
- `✅ Order [id] added. Total orders: X`

### 3. Common Issues & Solutions

#### Issue 1: Webhook Not Being Called
**Symptoms:**
- No webhook logs in Vercel
- Payment successful but no `🔔 Webhook received` log

**Solutions:**
1. **Check Webhook URL Configuration:**
   - Paystack: Go to Paystack Dashboard → Settings → Webhooks
   - Moolre: Check your Moolre dashboard webhook settings
   - URL should be: `https://your-domain.vercel.app/api/webhook` (for Paystack)
   - URL should be: `https://your-domain.vercel.app/api/moolre-webhook` (for Moolre)

2. **Verify Webhook is Active:**
   - Make sure the webhook is enabled in your payment provider dashboard

#### Issue 2: Webhook Signature Validation Failing
**Symptoms:**
- Log shows: `❌ Invalid webhook signature`

**Solutions:**
1. Verify `PAYSTACK_SECRET_KEY` in Vercel environment variables
2. Make sure you're using the correct secret key (not public key)
3. Redeploy after updating environment variables

#### Issue 3: Order Sync Failing
**Symptoms:**
- Webhook receives payment
- Log shows: `❌ Internal sync failed`

**Solutions:**
1. Check if `/api/orders` endpoint is accessible
2. Verify no CORS issues
3. Check Vercel function logs for errors

#### Issue 4: In-Memory Storage Reset
**Symptoms:**
- Orders appear briefly then disappear
- Orders don't persist between sessions

**Cause:**
The current implementation uses in-memory storage which resets when:
- Vercel function cold starts
- Deployment updates
- Server restarts

**Solution (Temporary):**
This is expected behavior with in-memory storage. Orders will reset periodically.

**Solution (Permanent):**
Implement persistent storage (see "Implementing Persistent Storage" below)

### 4. Testing the Webhook Locally

You can test if webhooks are working by checking the Vercel logs immediately after making a payment:

1. Make a test payment
2. Immediately go to Vercel Dashboard → Your Project → Logs
3. Filter by "Functions" or search for "webhook"
4. Look for the log messages listed above

### 5. Admin Dashboard Not Refreshing

**Symptoms:**
- Webhook logs show order was added
- Admin dashboard shows 0 orders

**Solutions:**
1. **Hard Refresh:** Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear Cache:** Clear browser cache and reload
3. **Check Console:** Open browser console (F12) and look for:
   - `🔄 Loading real-time data...`
   - `🔄 Auto-refreshing data...`
   - `✅ Loaded X orders from API`
4. **Wait for Auto-Refresh:** Dashboard auto-refreshes every 10 seconds

### 6. Verify API is Accessible

Test the orders API directly:

1. Open browser
2. Go to: `https://your-domain.vercel.app/api/orders`
3. You should see JSON response: `{"success": true, "orders": [...], "count": X}`

## Implementing Persistent Storage

To make orders persist permanently, you need to use a database. Here are recommended options:

### Option 1: Vercel KV (Redis)
```javascript
import { kv } from '@vercel/kv';

// Store order
await kv.lpush('orders', JSON.stringify(order));

// Get all orders
const orders = await kv.lrange('orders', 0, -1);
```

### Option 2: Vercel Postgres
```javascript
import { sql } from '@vercel/postgres';

// Create table
await sql`CREATE TABLE IF NOT EXISTS orders (...)`;

// Insert order
await sql`INSERT INTO orders VALUES (...)`;

// Get all orders
const { rows } = await sql`SELECT * FROM orders`;
```

### Option 3: MongoDB Atlas (Free Tier)
```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('mickeysbundle');
const orders = db.collection('orders');

// Insert order
await orders.insertOne(order);

// Get all orders
const allOrders = await orders.find({}).toArray();
```

## Quick Checklist

When an order doesn't appear, check:

- [ ] Payment was successful (check payment provider dashboard)
- [ ] Webhook URL is correctly configured
- [ ] Webhook logs show in Vercel (🔔 Webhook received)
- [ ] Order was created (📦 Order created log)
- [ ] Order sync was successful (✅ Order sync response)
- [ ] Admin dashboard is refreshing (check browser console)
- [ ] No errors in Vercel function logs
- [ ] Environment variables are set correctly

## Getting More Help

If orders still don't appear:

1. **Check Vercel Logs:** This is the most important diagnostic tool
2. **Share Logs:** Copy the relevant log entries
3. **Check Network Tab:** Open browser DevTools → Network tab → Look for `/api/orders` requests
4. **Verify Payment:** Confirm payment actually went through in payment provider dashboard

## Current Limitations

**In-Memory Storage:**
- Orders reset on server restart
- Orders don't persist between deployments
- Not suitable for production

**Recommendation:**
Implement one of the persistent storage solutions above for production use.
