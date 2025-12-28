export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { otpCode, paymentPhone, recipientPhone, moolreData } = req.body;

        if (!otpCode || !moolreData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const MOOLRE_API_KEY = process.env.MOOLRE_API_KEY;
        const MOOLRE_API_USER = process.env.MOOLRE_API_USER;

        // Step 3: Verify OTP by resending payload with otpcode
        const payload = { ...moolreData, otpcode: otpCode };

        console.log('Verifying OTP (Step 3):', JSON.stringify(payload));

        const response = await fetch('https://api.moolre.com/open/transact/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-USER': MOOLRE_API_USER,
                'X-API-PUBKEY': MOOLRE_API_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('OTP Verification Response:', JSON.stringify(data));

        if (data.status === 'success' || data.code === '00' || data.code === 'TP14-SUCCESS') {
            // OTP Verified. Now Step 5: Trigger actual payment (Optional if Moolre does it auto? Docs say "Trigger Payment Prompt")
            // Docs say: "Pass all required parameters to this endpoint again (without OTP) to initiate the actual payment request."

            // Let's trigger step 5
            const finalPayload = { ...moolreData }; // Original payload without OTP
            console.log('Triggering Payment (Step 5)...');

            const finalResponse = await fetch('https://api.moolre.com/open/transact/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-USER': MOOLRE_API_USER,
                    'X-API-PUBKEY': MOOLRE_API_KEY
                },
                body: JSON.stringify(finalPayload)
            });

            const finalData = await finalResponse.json();
            console.log('Final Payment Trigger Response:', JSON.stringify(finalData));

            if (finalData.status === 'success' || finalData.code === '00') {
                return res.status(200).json({ success: true, message: 'Payment prompt sent' });
            } else {
                return res.status(400).json({ error: finalData.message || 'Payment trigger failed' });
            }

        } else {
            return res.status(400).json({ error: data.message || 'OTP Verification failed' });
        }

    } catch (error) {
        console.error('OTP Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
