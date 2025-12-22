export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { paymentPhone, recipientPhone, network, amount, bundle } = req.body;

        // Validation
        if (!paymentPhone || !recipientPhone || !network || !amount || !bundle) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['paymentPhone', 'recipientPhone', 'network', 'amount', 'bundle']
            });
        }

        // Validate phone number format (Ghana format: 10 digits starting with 0)
        const phoneRegex = /^0[0-9]{9}$/;
        if (!phoneRegex.test(paymentPhone)) {
            return res.status(400).json({ error: 'Invalid payment phone number format' });
        }
        if (!phoneRegex.test(recipientPhone)) {
            return res.status(400).json({ error: 'Invalid recipient phone number format' });
        }

        // Get API Key from environment variable
        const MOOLRE_API_KEY = process.env.MOOLRE_API_KEY;
        const ADMIN_WEBHOOK_URL = process.env.ADMIN_WEBHOOK_URL || 'https://your-domain.com/api/webhook';

        if (!MOOLRE_API_KEY) {
            console.error('MOOLRE_API_KEY is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Map network codes to Moolre's expected format
        const moolreNetworkMap = {
            'mtn': 'MTN',
            'mtn-afa': 'MTN', // AFA is processed as MTN
            'airteltigo': 'AIRTELTIGO'
        };

        const provider = moolreNetworkMap[network] || network.toUpperCase();

        // Generate unique transaction reference
        const transactionRef = `MBS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Construct payload for Moolre API
        // NOTE: Verify exact field names with Moolre documentation
        const payload = {
            amount: parseFloat(amount),
            customer_msisdn: paymentPhone.replace(/^0/, '233'), // Convert 0XX to 233XX
            provider: provider,
            reference: transactionRef,
            narration: `Data Bundle: ${bundle}`,
            callback_url: ADMIN_WEBHOOK_URL,
            metadata: {
                bundle: bundle,
                network: network,
                recipientPhone: recipientPhone,
                paymentPhone: paymentPhone,
                timestamp: new Date().toISOString()
            }
        };

        console.log('Initiating payment with reference:', transactionRef);
        console.log('Payment from:', paymentPhone, 'Data to:', recipientPhone);

        // Call Moolre API
        const response = await fetch('https://api.moolre.com/v1/payments/mobile-money', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MOOLRE_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Moolre API Error:', data);
            return res.status(response.status).json({
                error: data.message || 'Payment initiation failed',
                details: data
            });
        }

        // Store transaction in database (if you have one)
        // await storeTransaction({ transactionRef, paymentPhone, recipientPhone, network, bundle, amount, status: 'pending' });

        // Return success response
        return res.status(200).json({
            success: true,
            transactionRef: transactionRef,
            message: 'Payment initiated successfully',
            data: data
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
