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
        const MOOLRE_API_KEY = process.env.MOOLRE_API_KEY; // Public Key
        const MOOLRE_PRIVATE_KEY = process.env.MOOLRE_PRIVATE_KEY;
        const MOOLRE_API_USER = process.env.MOOLRE_API_USER;
        const MOOLRE_ACCOUNT_NUMBER = process.env.MOOLRE_ACCOUNT_NUMBER;

        if (!MOOLRE_API_KEY || !MOOLRE_API_USER || !MOOLRE_ACCOUNT_NUMBER) {
            console.error('Moolre credentials incomplete');
            return res.status(500).json({ error: 'Server configuration error: Missing API User or Account Number' });
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
            "type": "1", // Must be 1
            "channel": provider,
            "currency": "GHS",
            "payer": paymentPhone,
            "amount": amount,
            "externalref": transactionRef,
            "reference": `${bundle} Bundle`,
            "accountnumber": MOOLRE_ACCOUNT_NUMBER // Required
        };

        console.log('Initiating payment (Step 1):', JSON.stringify(payload));

        const headers = {
            'Content-Type': 'application/json',
            'X-API-USER': MOOLRE_API_USER,
            'X-API-PUBKEY': MOOLRE_API_KEY
        };

        // If user provided a PRIVATE key, send it too (some flows need it)
        if (MOOLRE_PRIVATE_KEY) {
            headers['X-API-KEY'] = MOOLRE_PRIVATE_KEY;
        }

        const response = await fetch('https://api.moolre.com/open/transact/payment', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Moolre Raw Response:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Moolre Response Parse Error:', e);
            throw new Error(`Gateway Error (${response.status}): ${text.substring(0, 100)}`);
        }

        // Handle OTP Requirement (Code TP14)
        if (data.code === 'TP14') {
            return res.status(200).json({
                success: true,
                requireOtp: true,
                message: 'OTP sent to customer',
                transactionRef: transactionRef,
                moolreData: payload // Pass payload back to frontend to re-submit with OTP
            });
        }

        if (response.ok && (data.status === 'success' || data.code === '00')) {
            return res.status(200).json({
                success: true,
                transactionRef: transactionRef,
                message: 'Payment prompt sent successfully',
                gatewayResponse: data
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
