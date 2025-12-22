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
        const API_USERNAME = process.env.THETELLER_API_USERNAME;
        const API_KEY = process.env.THETELLER_API_KEY; // Base64 encoded 'username:apikey' usually, or just apikey

        if (!API_USERNAME || !API_KEY) {
            console.error('TheTeller credentials not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Map network to TheTeller R-Switch
        // MTN = MTN, AirtelTigo = ATL, Vodafone/Telecel = VOD
        const rSwitchMap = {
            'mtn': 'MTN',
            'mtn-afa': 'MTN', // AFA uses MTN MOMO
            'airteltigo': 'ATL', // Or TGO, verify with documentation. ATL is common.
            'telecel': 'VOD'
        };

        const rSwitch = rSwitchMap[network];
        if (!rSwitch) {
            return res.status(400).json({ error: 'Unsupported network for payment' });
        }

        // Generate 12-digit numeric transaction ID
        const transactionRef = Math.floor(100000000000 + Math.random() * 900000000000).toString();

        // Amount must be formatted string padded to 12 chars? 
        // Docs say amount in minor units (pesewas) usually, e.g. "000000000100" for 1 GHS
        // Let's verify standard behavior. Usually JSON APIs take 1.00 or "000000000100".
        // TheTeller standard: 12 digit string, last 2 are decimals. 
        // e.g. 1.50 -> 150 -> "000000000150"
        const amountMinor = Math.round(amount * 100);
        const amountString = amountMinor.toString().padStart(12, '0');

        const payload = {
            "merchant_id": API_USERNAME, // Often the username is the merchant ID
            "transaction_id": transactionRef,
            "desc": `${bundle} Bundle for ${recipientPhone}`,
            "amount": amountString,
            "processing_code": "000200", // 000200 is often used for MoMo debit
            "r-switch": rSwitch,
            "subscriber_number": paymentPhone,
            "voucher_code": "" // Optional, for VOD sometimes
        };

        const auth = Buffer.from(`${API_USERNAME}:${API_KEY}`).toString('base64');

        console.log('Initiating payment with TheTeller:', transactionRef);

        const response = await fetch('https://prod.theteller.net/v1.1/transaction/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('TheTeller Response:', JSON.stringify(data));

        // '000' usually means approved/successful push
        if (data.code === '000' || data.status === 'success') {
            return res.status(200).json({
                success: true,
                transactionRef: transactionRef,
                message: 'Payment prompt sent successfully. Check your phone.',
                gatewayResponse: data,
                recipientPhone,
                bundle,
                network
            });
        } else {
            return res.status(400).json({
                error: data.reason || 'Payment initiation failed',
                details: data
            });
        }

    } catch (error) {
        console.error('Order Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
