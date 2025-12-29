export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        console.log('Received Moolre Webhook:', JSON.stringify(req.body));

        // Moolre payload structure
        // { "status": "success", "data": { "txstatus": "1", "externalref": "..." } }

        const event = req.body;

        if (event.status === 'success' && event.data && event.data.txstatus === '1') {
            const externalRef = event.data.externalref;
            const description = event.data.description || '';

            console.log(`✅ Moolre Payment Successful: ${externalRef}`);

            // Extract recipient phone and bundle from description
            // Format: "5GB Data Bundle for 0241234567"
            let recipientPhone = 'Unknown';
            let bundle = 'Unknown Bundle';

            const phoneMatch = description.match(/for (\d{10})/);
            const bundleMatch = description.match(/^(.+?) Data Bundle/);

            if (phoneMatch) recipientPhone = phoneMatch[1];
            if (bundleMatch) bundle = bundleMatch[1];

            // Build order object
            const order = {
                id: externalRef,
                recipientPhone: recipientPhone,
                paymentPhone: event.data.payer || recipientPhone,
                bundle: bundle,
                amount: parseFloat(event.data.amount) || 0,
                network: event.data.channel || 'Mobile Money',
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

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
                console.log('Order synced to admin dashboard');
            } catch (e) {
                console.warn("Internal sync failed", e.message);
            }

            return res.status(200).json({ status: 'ok' });
        }

        res.status(200).send('Webhook processed');
    } catch (error) {
        console.error('Moolre Webhook Error:', error);
        res.status(500).json({ error: error.message });
    }
}
