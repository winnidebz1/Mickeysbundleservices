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
        if (!paymentPhone.test(paymentPhone)) {
            return res.status(400).json({ error: 'Invalid payment phone number format' });
        }
        if (!phoneRegex.test(recipientPhone)) {
            return res.status(400).json({ error: 'Invalid recipient phone number format' });
        }

        // Get Moolre credentials from environment variables
        const MOOLRE_API_KEY = process.env.MOOLRE_API_KEY;
        const MOOLRE_API_USER = process.env.MOOLRE_API_USER;
        const MOOLRE_API_PUBKEY = process.env.MOOLRE_API_PUBKEY;

        if (!MOOLRE_API_KEY || !MOOLRE_API_USER || !MOOLRE_API_PUBKEY) {
            console.error('Moolre credentials not set');
            return res.status(500).json({ error: 'Server configuration error - Missing Moolre credentials' });
        }

        // Map network codes to Moolre's expected format
        const moolreNetworkMap = {
            'mtn': 'MTN',
            'mtn-afa': 'MTN',
            'airteltigo': 'AIRTELTIGO'
        };

        const provider = moolreNetworkMap[network] || network.toUpperCase();

        // Generate unique transaction reference
        const transactionRef = `MBS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Construct payload for Moolre API
        // Note: Check Moolre's Payments API documentation for exact field names
        const payload = {
            amount: parseFloat(amount),
            phone: paymentPhone.replace(/^0/, '233'), // Convert 0XX to 233XX
            network: provider,
            reference: transactionRef,
            description: `Data Bundle: ${bundle} for ${recipientPhone}`,
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
        console.log('Payload:', JSON.stringify(payload, null, 2));

        // Call Moolre API with correct authentication headers
        const response = await fetch('https://api.moolre.com/payments/collect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-USER': MOOLRE_API_USER,
                'X-API-KEY': MOOLRE_API_KEY,
                'X-API-PUBKEY': MOOLRE_API_PUBKEY,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Get response text first to handle both JSON and non-JSON responses
        const responseText = await response.text();
        console.log('Moolre API Response Status:', response.status);
        console.log('Moolre API Response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse Moolre response as JSON:', parseError);
            return res.status(500).json({
                error: 'Invalid response from payment gateway',
                details: responseText.substring(0, 500) // First 500 chars for debugging
            });
        }

        // Check Moolre's response format: status: 1 = success, 0 = failure
        if (data.status !== 1) {
            console.error('Moolre API Error:', data);
            return res.status(400).json({
                error: data.message || 'Payment initiation failed',
                code: data.code,
                details: data
            });
        }

        // Return success response
        return res.status(200).json({
            success: true,
            transactionRef: transactionRef,
            message: data.message || 'Payment initiated successfully',
            data: data.data
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
