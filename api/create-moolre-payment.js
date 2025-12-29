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
        const MOOLRE_API_KEY = process.env.MOOLRE_API_KEY; // Private Key (X-API-KEY)
        const MOOLRE_API_USER = process.env.MOOLRE_API_USER;
        const MOOLRE_API_PUBKEY = process.env.MOOLRE_API_PUBKEY;
        const MOOLRE_ACCOUNT_NUMBER = process.env.MOOLRE_ACCOUNT_NUMBER;

        if (!MOOLRE_API_KEY || !MOOLRE_API_USER || !MOOLRE_API_PUBKEY || !MOOLRE_ACCOUNT_NUMBER) {
            console.error('Moolre credentials not set');
            return res.status(500).json({ error: 'Server configuration error: Missing Moolre Keys' });
        }

        if (MOOLRE_API_KEY.includes('your_') || MOOLRE_ACCOUNT_NUMBER.includes('your_')) {
            return res.status(500).json({ error: 'Please update .env.local with your REAL Moolre keys.' });
        }

        // Map network to Moolre codes
        const networkMap = {
            'mtn': 'mtn',
            'mtn-afa': 'mtn',
            'airteltigo': 'airteltigo',
            'telecel': 'vodafone' // Moolre uses 'vodafone' for Telecel
        };

        const channel = networkMap[network];
        if (!channel) {
            return res.status(400).json({ error: 'Unsupported network for Moolre' });
        }

        const externalRef = `MBS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Moolre Collection Payload
        const payload = {
            "type": "1", // Collection
            "channel": channel,
            "currency": "GHS",
            "payer": paymentPhone,
            "amount": amount, // Moolre uses GHS float/int, NOT Pesewas
            "externalref": externalRef,
            "accountnumber": MOOLRE_ACCOUNT_NUMBER,
            "description": `${bundle} Data Bundle for ${recipientPhone}`
        };

        console.log('Initiating Moolre Payment:', JSON.stringify(payload));

        const response = await fetch('https://api.moolre.com/open/transact/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': MOOLRE_API_KEY,      // Private Key
                'X-API-USER': MOOLRE_API_USER,    // Username
                'X-API-PUBKEY': MOOLRE_API_PUBKEY // Public Key
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Moolre Raw Response:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            // Moolre sometimes returns non-JSON errors (HTML)
            throw new Error(`Gateway Error (${response.status}): ${text.substring(0, 100)}`);
        }

        // Handle Moolre Response
        if (data.status === 'success' || data.code === '00' || data.code === 'TP14-SUCCESS') {
            return res.status(200).json({
                success: true,
                message: data.message || 'Payment prompt sent successfully',
                gatewayResponse: data,
                transactionRef: externalRef,
                // Moolre might require OTP (TP14 code), handle similarly to Paystack if needed
                requireOtp: false // Moolre usually handles generic collections via STK push unless told otherwise
            });
        } else {
            return res.status(400).json({
                error: data.message || 'Payment initiation failed',
                details: data
            });
        }

    } catch (error) {
        console.error('Moolre Order Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
