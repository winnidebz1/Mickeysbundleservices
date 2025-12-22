# Mickey's Bundle Services - Data Reseller Website

A modern, mobile-first data reselling platform for Ghana featuring MTN, MTN AFA, and AirtelTigo bundles with secure Moolre payment integration.

## 🎯 Features

### Customer-Facing Website (`index.html`)
- **Hero Section**: Compelling call-to-action with network logos
- **Network Selection**: Interactive cards for MTN, MTN AFA, and AirtelTigo
- **Dynamic Bundle Pricing**: Real-time pricing for all networks
- **Secure Payment Flow**: Moolre integration with PIN-on-device security
- **How It Works**: 4-step purchase process
- **Trust & Security**: Clear messaging about payment security
- **Contact Section**: WhatsApp, phone, and email support

### Admin Dashboard (`admin.html`)
- **Dashboard Overview**: Revenue, orders, and performance stats
- **Transaction Management**: View, filter, and export all transactions
- **Pending Orders**: Quick actions to complete or cancel orders
- **Settings**: Payment gateway and notification configuration
- **Real-time Updates**: Live transaction monitoring

## 📦 Bundle Pricing

### MTN
- 1GB - GH₵ 6.50
- 2GB - GH₵ 11.50
- 5GB - GH₵ 27
- 10GB - GH₵ 49
- 20GB - GH₵ 90
- 50GB - GH₵ 220
- 100GB - GH₵ 420
- *And more...*

### MTN AFA
- 5GB - GH₵ 28
- 10GB - GH₵ 50
- 20GB - GH₵ 90
- 30GB - GH₵ 130
- 40GB - GH₵ 180
- 50GB - GH₵ 215

### AirtelTigo
- 1GB - GH₵ 6
- 2GB - GH₵ 11
- 5GB - GH₵ 26
- 10GB - GH₵ 50
- 15GB - GH₵ 72
- *And more...*

## 🔐 Security Features

- **No PIN Collection**: MoMo PINs are NEVER collected on the website
- **Moolre Integration**: Certified third-party payment gateway
- **Device-Based Authentication**: PIN entry happens only on user's phone
- **Secure Webhooks**: Real-time payment confirmation
- **Encrypted Transactions**: All payment data is encrypted

## 🚀 Payment Flow

1. **Select Bundle**: Choose network and data package
2. **Enter Details**: Provide recipient phone number
3. **Choose Payment**: Select MTN MoMo, Telecel Cash, or AirtelTigo Money
4. **Approve on Phone**: Enter MoMo PIN on your device (NOT on website)
5. **Receive Data**: Bundle delivered within 10-15 minutes

## 📱 Mobile-First Design

- Fully responsive across all devices
- Touch-optimized buttons and interactions
- Mobile menu with smooth animations
- Network-specific color schemes:
  - MTN: Yellow (#FFCC00) and Black
  - AirtelTigo: Red (#E4032E) and Blue (#1F3A93)

## 🎨 Design Features

- **Modern Aesthetics**: Glassmorphism, gradients, and smooth animations
- **Premium Typography**: Inter font family
- **Micro-interactions**: Hover effects and scroll animations
- **Color Psychology**: Network-branded color schemes
- **Accessibility**: High contrast, readable fonts, semantic HTML

## 📂 File Structure

```
Mickey's Bundle Services/
├── index.html              # Main customer website
├── admin.html              # Admin dashboard
├── assets/
│   ├── css/
│   │   ├── styles.css      # Main styles
│   │   └── admin.css       # Admin dashboard styles
│   ├── js/
│   │   ├── main.js         # Main functionality
│   │   ├── bundles-data.js # Bundle pricing data
│   │   └── admin.js        # Admin dashboard logic
│   └── images/
│       ├── mtn-logo.png
│       ├── mtn-afa-logo.png
│       └── airteltigo-logo.png
└── README.md
```

## 🛠️ Setup Instructions

### 1. Add Network Logos
Copy your network logo images to `assets/images/`:
- `mtn-logo.png`
- `mtn-afa-logo.png`
- `airteltigo-logo.png`

### 2. Configure Moolre Payment Gateway
In `admin.html` settings section:
- Add your Moolre API key
- Configure webhook URL
- Set notification preferences

### 3. Update Contact Information
In `index.html`, update:
- WhatsApp number (line with `wa.me/233XXXXXXXXX`)
- Phone number
- Email address

### 4. Deploy
Upload all files to your web hosting service maintaining the folder structure.

## 🔧 Customization

### Update Bundle Prices
Edit `assets/js/bundles-data.js`:
```javascript
const bundlesData = {
    mtn: [
        { size: '1GB', price: 6.50, delivery: '10-15 min' },
        // Add or modify bundles
    ]
};
```

### Change Colors
Edit CSS variables in `assets/css/styles.css`:
```css
:root {
    --color-mtn: #FFCC00;
    --color-airteltigo: #E4032E;
    /* Customize colors */
}
```

## 📊 Admin Dashboard Features

- **Real-time Stats**: Revenue, orders, pending count
- **Transaction History**: Complete audit trail
- **Search & Filter**: Find transactions quickly
- **Export to CSV**: Download transaction reports
- **Manual Fulfillment**: Mark orders as complete
- **Order Management**: Cancel or resend failed orders

## 🔗 Integration Notes

### Moolre API Integration (Production)
Replace the simulated payment flow in `assets/js/main.js` with actual Moolre API calls:

```javascript
// Example Moolre API integration
async function initiateMoolrePayment(phone, amount, network) {
    const response = await fetch('https://api.moolre.com/v1/payment', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phone: phone,
            amount: amount,
            network: network,
            callback_url: 'https://yourdomain.com/webhook'
        })
    });
    return response.json();
}
```

## 📞 Support

For technical support or customization requests:
- WhatsApp: 055 410 4763
- Email: support@mickeysbundle.com

## 📝 License

© 2024 Mickey's Bundle Services. All rights reserved.

---

**Built with ❤️ for Ghana's digital economy**
