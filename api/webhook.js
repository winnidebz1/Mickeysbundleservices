export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const webhookData = req.body;

        console.log('Webhook received:', JSON.stringify(webhookData, null, 2));

        // Verify webhook signature if Moolre provides one
        // const signature = req.headers['x-moolre-signature'];
        // if (!verifySignature(signature, webhookData)) {
        //     return res.status(401).json({ error: 'Invalid signature' });
        // }

        const {
            status,
            reference,
            amount,
            customer_msisdn,
            metadata
        } = webhookData;

        // Update transaction status in your database
        // await updateTransaction(reference, { status, webhookData });

        if (status === 'success' || status === 'completed') {
            console.log('✅ Payment successful for reference:', reference);

            // Extract bundle information from metadata
            const { bundle, network, recipientPhone, paymentPhone } = metadata || {};

            if (bundle && network && recipientPhone) {
                // Create order object for manual delivery
                const order = {
                    id: reference,
                    bundle: bundle,
                    network: network,
                    recipientPhone: recipientPhone,
                    paymentPhone: paymentPhone || customer_msisdn,
                    amount: amount,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                };

                console.log('📦 NEW ORDER - MANUAL DELIVERY REQUIRED:');
                console.log(`   Bundle: ${bundle}`);
                console.log(`   Network: ${network}`);
                console.log(`   Recipient: ${recipientPhone}`);
                console.log(`   Amount: GH₵ ${amount}`);
                console.log(`   Reference: ${reference}`);
                console.log('   👉 Check your admin panel to process this order');

                // You can add the order to a database or send yourself a notification
                // For now, it will appear in the Vercel logs
            }
        } else if (status === 'failed') {
            console.log('❌ Payment failed for reference:', reference);
        }

        // Always return 200 to acknowledge receipt
        return res.status(200).json({
            success: true,
            message: 'Webhook processed'
        });

    } catch (error) {
        console.error('Webhook processing error:', error);
        // Still return 200 to prevent Moolre from retrying
        return res.status(200).json({
            success: false,
            error: error.message
        });
    }
}
