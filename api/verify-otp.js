export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { otpCode, paystackReference } = req.body;

        if (!otpCode || !paystackReference) {
            return res.status(400).json({ error: 'Missing OTP or Payment Reference' });
        }

        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

        console.log('Submitting OTP to Paystack:', paystackReference);

        const response = await fetch('https://api.paystack.co/charge/submit_otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
            },
            body: JSON.stringify({
                otp: otpCode,
                reference: paystackReference
            })
        });

        const text = await response.text();
        console.log('Paystack OTP Response:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Gateway Error (${response.status}): ${text.substring(0, 100)}`);
        }

        if (data.status === true) {
            const chargeData = data.data;
            if (chargeData.status === 'success' || chargeData.status === 'pending') {
                return res.status(200).json({
                    success: true,
                    message: chargeData.display_text || 'Payment completed successfully'
                });
            } else {
                return res.status(400).json({ error: chargeData.message || 'OTP Verification failed' });
            }
        } else {
            return res.status(400).json({ error: data.message || 'OTP Verification failed' });
        }

    } catch (error) {
        console.error('OTP Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
