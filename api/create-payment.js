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
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

        if (!PAYSTACK_SECRET_KEY) {
            console.error('Paystack credentials not set');
            return res.status(500).json({ error: 'Server configuration error: Missing Paystack Key' });
        }

        // Map network to Paystack codes
        // Paystack GH Codes: 'mtn', 'vod', 'tgo'
        const networkMap = {
            'mtn': 'mtn',
            'mtn-afa': 'mtn',
            'airteltigo': 'tgo',
            'telecel': 'vod' // Telecel/Vodafone
        };

        const provider = networkMap[network];
        if (!provider) {
            return res.status(400).json({ error: 'Unsupported network' });
        }

        const transactionRef = `MBS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const email = "customer@mickeysbundles.com"; // Required by Paystack

        // Paystack Charge Payload for Mobile Money
        const payload = {
            "email": email,
            "amount": amount * 100, // Paystack is in Pesewas (Multiply by 100)
            "currency": "GHS",
            "mobile_money": {
                "phone": paymentPhone,
                "provider": provider
            },
            "reference": transactionRef,
            "metadata": {
                "custom_fields": [
                    { "display_name": "Bundle", "variable_name": "bundle", "value": bundle },
                    { "display_name": "Recipient", "variable_name": "recipient_phone", "value": recipientPhone }
                ]
            }
        };

        console.log('Initiating Paystack Charge:', JSON.stringify(payload));

        const response = await fetch('https://api.paystack.co/charge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Paystack Raw Response:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Gateway Error (${response.status}): ${text.substring(0, 100)}`);
        }

        if (data.status === true) {
            // Check specific charge status
            const chargeData = data.data;
            const status = chargeData.status;

            console.log(`Paystack Charge Status: ${status}`);

            // If it requires OTP
            if (status === 'send_otp' || status === 'otp') {
                return res.status(200).json({
                    success: true,
                    requireOtp: true,
                    message: chargeData.display_text,
                    transactionRef: transactionRef,
                    paystackReference: chargeData.reference,
                    rawStatus: status
                });
            }

            // For ALL other statuses (pending, queued, open, processing, success), treat as Success
            // blocked/failed/abandoned would likely have data.status === false or be handled here
            if (status !== 'failed' && status !== 'abandoned') {
                return res.status(200).json({
                    success: true,
                    transactionRef: transactionRef,
                    message: chargeData.display_text || 'Payment prompt sent successfully',
                    gatewayResponse: data,
                    rawStatus: status
                });
            }

            // Actual Failure
            return res.status(400).json({ error: chargeData.message || `Payment failed (Status: ${status})` });

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
