export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone, network, amount, bundle } = req.body;

        // Validation
        if (!phone || !network || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get API Key from environment variable
        const API_KEY = process.env.MOOLRE_API_KEY;

        if (!API_KEY) {
            console.error('MOOLRE_API_KEY is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Map your internal network codes to Moolre's expected format if needed
        // For now sending the network name directly, ensure these match Moolre's docs
        const moolreNetworkMap = {
            'mtn': 'MTN',
            'mtn-afa': 'MTN', // AFA is usually processed as MTN
            'airteltigo': 'AIRTELTIGO',
            'telecel': 'IS_TELECEL' // Verify Telecel code with Moolre docs
        };

        const provider = moolreNetworkMap[network] || network.toUpperCase();

        // Construct payload for Moolre API
        // Note: This endpoint and payload structure is based on standard payment APIs.
        // You MUST verify the exact endpoint and field names from Moolre's documentation.
        const payload = {
            amount: amount,
            customer_msisdn: phone, // Phone number
            provider: provider,
            narration: `Purchase of ${bundle} for ${phone}`,
            // Add other required fields by Moolre
        };
        
        console.log('Initiating payment with payload:', payload);

        const response = await fetch('https://api.moolre.com/v1/payments/mobile-money', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
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

        // Return the success response to the client
        return res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
