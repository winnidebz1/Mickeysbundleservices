import crypto from 'crypto';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const webhookData = req.body;
        console.log('TheTeller Webhook received:', JSON.stringify(webhookData, null, 2));

        // Basic Signature Verification (Optional but recommended)
        // const signature = req.headers['teller-signature'];
        // const api_user = process.env.THETELLER_API_USERNAME;
        // Verify against your records if needed

        const {
            status,
            code,
            reason,
            transaction_id,
            amount,
            subscriber_number,
            r_switch, // Network
            desc
        } = webhookData;

        // TheTeller Success Code is usually '000'
        if (code === '000' || status === 'success' || status === 'approved') {
            console.log('✅ Payment successful for transaction:', transaction_id);
            console.log(`   Amount: ${amount}`);
            console.log(`   Payer: ${subscriber_number}`);
            console.log(`   Description: ${desc}`);

            // Parse description to get bundle info since we put it there
            // Format was: "1GB Bundle for 055xxxxxxx"
            let bundle = "Unknown Bundle";
            let recipient = "Unknown Recipient";

            if (desc) {
                const parts = desc.split(' for ');
                if (parts.length >= 2) {
                    bundle = parts[0].replace(' Bundle', '').trim();
                    recipient = parts[1].trim();
                }
            }

            // Create order object for manual delivery log
            const order = {
                id: transaction_id,
                bundle: bundle,
                network: r_switch || 'Unknown',
                recipientPhone: recipient,
                paymentPhone: subscriber_number,
                amount: amount, // TheTeller sends amount as string e.g. "000000000100" or raw? Check logs.
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            console.log('📦 NEW ORDER - MANUAL DELIVERY REQUIRED:');
            console.log(JSON.stringify(order, null, 2));
            console.log('   👉 Check your admin panel or automatic delivery system');

            // Here you would trigger the bundle delivery API

        } else {
            console.log('❌ Payment failed or pending:', transaction_id);
            console.log('   Reason:', reason);
        }

        // Always return 200 to acknowledge receipt
        return res.status(200).json({
            success: true,
            message: 'Webhook processed'
        });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(200).json({
            success: false,
            error: error.message
        });
    }
}
