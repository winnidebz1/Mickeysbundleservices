export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const webhookData = req.body;
        console.log('Moolre Webhook received:', JSON.stringify(webhookData, null, 2));

        // Moolre Validation Logic
        // Moolre typically sends { status: 'success', reference: '...', ... }

        const { status, reference, transaction_id, amount, customer_number } = webhookData;

        // 1. Check Status
        if (status === 'success' || status === 'successful' || status === 1) {
            console.log('✅ Payment successful for:', reference);

            // 2. (Optional) Verify with Moolre API if needed
            // const verified = await verifyMoolreTransaction(reference);

            const order = {
                id: reference || transaction_id,
                bundle: "Unknown (Check Description)", // Moolre might not send description back in webhook
                network: 'Mobile Money',
                recipientPhone: customer_number || 'Unknown',
                paymentPhone: customer_number || 'Unknown',
                amount: amount,
                timestamp: new Date().toISOString(),
                status: 'paid'
            };

            // 3. Logic to extract bundle info if passed in metadata or description
            // If Moolre passes custom metadata, retrieve it here.

            console.log('📦 COMPLETING ORDER (MOOLRE):');
            console.log(JSON.stringify(order, null, 2));

            // Deliver Bundle
            await deliverBundle(order);

            // Update internal list
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

        } else {
            console.log('❌ Payment failed/pending:', reference);
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(200).json({ success: true }); // Always 200 to satisfy webhook sender
    }
}

async function deliverBundle(order) {
    // Bundle delivery logic here
    const BUNDLE_API_URL = process.env.BUNDLE_API_URL;
    const BUNDLE_API_KEY = process.env.BUNDLE_API_KEY;

    if (!BUNDLE_API_URL) {
        console.log('Simulating Bundle Delivery...');
        return;
    }

    // Call Provider
}
