# Admin Dashboard - Mickey's Bundle Services

## Overview
A fully responsive admin dashboard has been created to view all data orders and track where data bundles should be disbursed.

## Features

### 📊 Dashboard View
- **Total Revenue**: Shows cumulative revenue from successful transactions
- **Total Orders**: Count of all orders placed
- **Pending Orders**: Orders awaiting data disbursement
- **Completed Today**: Orders successfully completed today
- **Recent Transactions**: Quick view of the latest 5 transactions

### 💳 Transactions Page
- Complete list of all transactions
- Search functionality to find specific orders
- Filter by status (All, Pending, Successful, Failed)
- Export to CSV for record keeping
- Clear display of:
  - Transaction ID
  - Date & Time
  - **Recipient Phone** (where data should be sent)
  - Network (MTN, MTN AFA, AirtelTigo)
  - Bundle size
  - Payment method
  - Amount
  - Status

### ⏳ Pending Orders
- Card-based view of orders awaiting disbursement
- Prominently displays **Recipient Phone Number**
- Shows bundle size, network, and amount
- Action buttons:
  - **Mark as Complete**: After data is disbursed
  - **Cancel**: For failed or cancelled orders

### ⚙️ Settings
- Payment gateway configuration
- Notification settings

## Mobile Responsiveness

### ✅ Fully Mobile Optimized
- **Hamburger Menu**: Appears on screens ≤ 968px
- **Slide-out Sidebar**: Smooth animation with overlay
- **Touch-Friendly**: All buttons and cards are optimized for touch
- **Responsive Tables**: Horizontal scrolling on mobile for data tables
- **Adaptive Layout**: Stats cards stack vertically on mobile
- **Auto-Close**: Sidebar closes automatically after navigation

### Mobile Breakpoints
- **Desktop**: Full sidebar visible (> 968px)
- **Tablet**: Collapsible sidebar (≤ 968px)
- **Mobile**: Optimized layout with hamburger menu (≤ 480px)

## Access

### From Main Website
The admin dashboard is accessible via a link in the footer of the main website:
- Navigate to the bottom of `index.html`
- Click "Admin Dashboard" (highlighted in yellow)

### Direct Access
Open `admin.html` directly in your browser

## Data Flow

### Order Creation
1. Customer purchases bundle on main website
2. Payment processed via Moolre or Paystack
3. Webhook receives payment confirmation
4. Order data extracted including:
   - Recipient phone number (where data goes)
   - Payment phone number (who paid)
   - Bundle size
   - Network
   - Amount

### Order Display
- Orders appear in real-time on the admin dashboard
- Auto-refresh every 30 seconds
- Manual refresh available via refresh button

### Order Management
1. View pending orders
2. Manually disburse data to the recipient phone number
3. Mark order as complete
4. Order moves from "Pending" to "Successful"

## Key Information Displayed

### Recipient Phone Number
- **Clearly labeled** as "Recipient Phone" throughout the dashboard
- This is the phone number where the data bundle should be sent
- Displayed prominently in:
  - Dashboard recent transactions
  - All transactions table
  - Pending orders cards

### Network Information
- Shows which network the bundle is for:
  - MTN
  - MTN AFA
  - AirtelTigo

## Technical Details

### Files Modified
- `admin.html` - Added mobile menu toggle and close button
- `assets/css/admin.css` - Enhanced mobile responsiveness
- `assets/js/admin.js` - Added mobile menu functionality and network names mapping
- `api/webhook.js` - Updated to store recipient phone
- `api/moolre-webhook.js` - Enhanced to extract and store order details
- `index.html` - Added admin dashboard link in footer

### Data Structure
```javascript
{
  id: "Transaction ID",
  recipientPhone: "0241234567", // Where data should be sent
  paymentPhone: "0557654321",   // Who paid
  bundle: "5GB",
  network: "mtn",
  amount: 27.00,
  timestamp: "2024-12-29T23:00:00Z",
  status: "pending"
}
```

## Usage Instructions

### Viewing Orders
1. Open admin dashboard
2. Click "Pending Orders" to see orders awaiting disbursement
3. Note the **Recipient Phone** number for each order
4. Manually send data to that phone number using your provider's system

### Completing Orders
1. After disbursing data, click "Mark as Complete"
2. Order status changes to "Successful"
3. Order is removed from pending list
4. Stats are automatically updated

### Searching & Filtering
1. Go to "Transactions" page
2. Use search box to find specific phone numbers or transaction IDs
3. Filter by status to see only pending, successful, or failed orders
4. Export data to CSV for external processing

## Auto-Refresh
- Dashboard automatically polls for new orders every 30 seconds
- No need to manually refresh the page
- New orders appear automatically in the pending list

## Next Steps
Consider integrating an automated data disbursement API to automatically send bundles when orders are received, eliminating the need for manual processing.
