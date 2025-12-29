const crypto = require('crypto');

// Helper function to handle bundle delivery
async function deliverBundle(order) {
    if (!order) return;

    console.log('🚚 Delivering Bundle:', order.bundle, 'to', order.recipientPhone);

    // In production, verify BUNDLE_API_URL exists
    const BUNDLE_API_URL = process.env.BUNDLE_API_URL;
    const BUNDLE_API_KEY = process.env.BUNDLE_API_KEY;

    if (!BUNDLE_API_URL || BUNDLE_API_URL.includes('your-bundle-provider')) {
        console.log('⚠️ Bundle API URL not configured. Simulating delivery only.');
        return true;
    }

    try {
        // Example call to provider
        // const response = await fetch(BUNDLE_API_URL, { ... });
        // console.log('Provider Response:', await response.json());
    } catch (e) {
        console.error('Failed to call bundle provider:', e);
    }

    return true;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // PER PAYSTACK DOCS: Verify Signature
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) {
            console.error('PAYSTACK_SECRET_KEY not set');
            return res.status(500).send('Server Config Error');
        }

        const hash = crypto.createHmac('sha512', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(400).send('Invalid Signature');
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;

            // Extract metadata if available
            const metadata = data.metadata || {};
            const customFields = metadata.custom_fields || [];

            // Build order object
            const order = {
                id: reference,
                recipientPhone: customFields.find(f => f.variable_name === 'recipient_phone')?.value || data.customer?.phone || 'Unknown',
                paymentPhone: data.customer?.phone || 'Unknown',
                bundle: customFields.find(f => f.variable_name === 'bundle')?.value || 'Unknown Bundle',
                amount: data.amount / 100, // Convert pesewas back to GHS
                network: customFields.find(f => f.variable_name === 'network')?.value || 'Mobile Money',
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            console.log('✅ Payment Successful:', reference);

            // Deliver Bundle
            await deliverBundle(order);

            // Sync with local DB / Admin Dashboard
            try {
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const host = req.headers.host;
                const ordersUrl = `${protocol}://${host}/api/orders`;
                await fetch(ordersUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'add', order })
                });
            } catch (e) { console.warn("Internal sync failed", e.message); }
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: error.message });
    }
}
