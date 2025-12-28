export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { paymentPhone, recipientPhone, network, amount, bundle } = req.body;

        if (!paymentPhone || !recipientPhone || !network || !amount || !bundle) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Configuration
        const MOOLRE_API_KEY = process.env.MOOLRE_API_KEY;
        // const MOOLRE_MERCHANT_ID = process.env.MOOLRE_MERCHANT_ID; // If needed

        if (!MOOLRE_API_KEY) {
            console.error('Moolre credentials not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Map network to Moolre codes
        const networkMap = {
            'mtn': 'MTN',
            'mtn-afa': 'MTN',
            'airteltigo': 'AIRTELTIGO',
            'telecel': 'VODAFONE'
        };

        const provider = networkMap[network];
        if (!provider) {
            return res.status(400).json({ error: 'Unsupported network' });
        }

        const transactionRef = `MBS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const payload = {
            "account_number": paymentPhone,
            "amount": amount,
            "network": provider,
            "reference": transactionRef,
            "description": `${bundle} Bundle for ${recipientPhone}`,
            // "channel": "mobile_money" // Common field
        };

        console.log('Initiating payment with Moolre:', JSON.stringify(payload));

        // Use the official Moolre API Endpoint
        // Note: Please verify the exact endpoint in your Moolre dashboard documentation
        // It is often /v1/payments/mobile-money or similar.
        const response = await fetch('https://api.moolre.com/v1/payments/collection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MOOLRE_API_KEY}`, // Or X-API-KEY: MOOLRE_API_KEY
                // 'X-API-KEY': MOOLRE_API_KEY 
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Moolre Response:', JSON.stringify(data));

        if (response.ok && (data.status === 'success' || data.code === '00')) {
            return res.status(200).json({
                success: true,
                transactionRef: transactionRef,
                message: 'Payment prompt sent successfully',
                gatewayResponse: data,
                recipientPhone,
                bundle,
                network
            });
        } else {
            return res.status(400).json({
                error: data.message || 'Payment initiation failed',
                details: data
            });
        }

    } catch (error) {
        console.error('Order Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
