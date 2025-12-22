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
            console.log('Payment successful for reference:', reference);

            // Extract bundle information from metadata
            const { bundle, network, recipientPhone } = metadata || {};

            if (bundle && network && recipientPhone) {
                // Trigger bundle delivery
                try {
                    await deliverBundle({
                        network,
                        bundle,
                        recipientPhone,
                        transactionRef: reference
                    });

                    console.log(`Bundle ${bundle} delivered to ${recipientPhone}`);
                } catch (deliveryError) {
                    console.error('Bundle delivery failed:', deliveryError);
                    // You might want to queue this for retry
                }
            }

            // Send confirmation SMS/email to customer
            // await sendConfirmation(customer_msisdn, bundle, recipientPhone);
        } else if (status === 'failed') {
            console.log('Payment failed for reference:', reference);
            // Handle failed payment
            // await notifyCustomer(customer_msisdn, 'Payment failed');
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

// Helper function to deliver bundle
async function deliverBundle({ network, bundle, recipientPhone, transactionRef }) {
    // This is where you'd integrate with your bundle delivery API
    // For example, if you have a reseller API from MTN, AirtelTigo, etc.

    console.log('Delivering bundle:', { network, bundle, recipientPhone, transactionRef });

    // Example: Call your bundle provider's API
    // const BUNDLE_API_KEY = process.env.BUNDLE_API_KEY;
    // const BUNDLE_API_URL = process.env.BUNDLE_API_URL;

    // const response = await fetch(BUNDLE_API_URL, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${BUNDLE_API_KEY}`
    //     },
    //     body: JSON.stringify({
    //         network: network,
    //         bundle: bundle,
    //         phone: recipientPhone,
    //         reference: transactionRef
    //     })
    // });

    // const result = await response.json();
    // return result;

    // For now, just log it
    return { success: true, message: 'Bundle delivery initiated' };
}
