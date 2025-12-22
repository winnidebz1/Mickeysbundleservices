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

        // Get Moolre credentials from environment variables
        const MOOLRE_API_USER = process.env.MOOLRE_API_USER;
        const MOOLRE_API_PUBKEY = process.env.MOOLRE_API_PUBKEY;
        const MOOLRE_ACCOUNT_NUMBER = process.env.MOOLRE_ACCOUNT_NUMBER;

        if (!MOOLRE_API_USER || !MOOLRE_API_PUBKEY || !MOOLRE_ACCOUNT_NUMBER) {
            console.error('Moolre credentials not set');
            return res.status(500).json({ error: 'Server configuration error - Missing Moolre credentials' });
        }

        // Map network codes to Moolre channel IDs
        const moolreChannelMap = {
            'mtn': 13,        // MTN Mobile Money
            'mtn-afa': 13,    // MTN AFA uses same channel
            'airteltigo': 14  // AirtelTigo Money (verify this ID)
        };

        const channel = moolreChannelMap[network];
        if (!channel) {
            return res.status(400).json({ error: 'Unsupported network' });
        }

        // Generate unique transaction reference
        const transactionRef = `MBS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Construct payload for Moolre API
        const payload = {
            type: 1,  // Direct Debit/Momo Prompt
            channel: channel,
            currency: 'GHS',
            payer: paymentPhone.replace(/^0/, '233'), // Convert 0XX to 233XX
            amount: parseFloat(amount),
            externalref: transactionRef,
            accountnumber: MOOLRE_ACCOUNT_NUMBER,
            reference: `${bundle} for ${recipientPhone}`
        };

        console.log('Initiating payment with Moolre');
        console.log('Reference:', transactionRef);
        console.log('Payment from:', paymentPhone, 'Data to:', recipientPhone);
        console.log('Payload:', JSON.stringify(payload, null, 2));

        // Call Moolre API with correct endpoint and headers
        const response = await fetch('https://api.moolre.com/open/transact/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-USER': MOOLRE_API_USER,
                'X-API-PUBKEY': MOOLRE_API_PUBKEY
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
                details: responseText.substring(0, 500)
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

        // Payment initiated successfully
        console.log('Payment initiated successfully:', data);

        // Return success response
        return res.status(200).json({
            success: true,
            transactionRef: transactionRef,
            message: data.message || 'Payment initiated successfully',
            moolreData: data.data,
            recipientPhone: recipientPhone,
            bundle: bundle,
            network: network
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
