export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { otpCode, paymentPhone, recipientPhone, network, amount, bundle, moolreData } = req.body;

        // Validation
        if (!otpCode || !paymentPhone || !moolreData) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['otpCode', 'paymentPhone', 'moolreData']
            });
        }

        // Get Moolre credentials
        const MOOLRE_API_USER = process.env.MOOLRE_API_USER;
        const MOOLRE_API_PUBKEY = process.env.MOOLRE_API_PUBKEY;
        const MOOLRE_ACCOUNT_NUMBER = process.env.MOOLRE_ACCOUNT_NUMBER;

        if (!MOOLRE_API_USER || !MOOLRE_API_PUBKEY || !MOOLRE_ACCOUNT_NUMBER) {
            console.error('Moolre credentials not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Map network codes to Moolre channel IDs
        const moolreChannelMap = {
            'mtn': 13,
            'mtn-afa': 13,
            'airteltigo': 14
        };

        const channel = moolreChannelMap[network];

        // Generate transaction reference (same as initial request)
        const transactionRef = moolreData.transactionRef || `MBS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Construct payload with OTP
        const payload = {
            type: 1,
            channel: channel,
            currency: 'GHS',
            payer: paymentPhone,
            amount: parseFloat(amount),
            externalref: transactionRef,
            accountnumber: MOOLRE_ACCOUNT_NUMBER,
            reference: `${bundle} for ${recipientPhone}`,
            otpcode: otpCode  // Add OTP code
        };

        console.log('Verifying OTP for payment:', transactionRef);
        console.log('OTP Code provided:', otpCode);

        // Call Moolre API with OTP
        const response = await fetch('https://api.moolre.com/open/transact/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-USER': MOOLRE_API_USER,
                'X-API-PUBKEY': MOOLRE_API_PUBKEY
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log('Moolre OTP Verification Response Status:', response.status);
        console.log('Moolre OTP Verification Response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse Moolre response:', parseError);
            return res.status(500).json({
                error: 'Invalid response from payment gateway',
                details: responseText.substring(0, 500)
            });
        }

        // Check if payment was successful
        if (data.status === 1) {
            console.log('Payment completed successfully!');

            // Return success
            return res.status(200).json({
                success: true,
                message: data.message || 'Payment completed successfully',
                transactionRef: transactionRef,
                recipientPhone: recipientPhone,
                bundle: bundle,
                network: network
            });
        } else {
            console.error('OTP verification failed:', data);
            return res.status(400).json({
                error: data.message || 'OTP verification failed',
                code: data.code
            });
        }

    } catch (error) {
        console.error('OTP verification error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
