export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        console.log('Received Moolre Webhook:', JSON.stringify(req.body));

        // Moolre payload structure
        // { "status": "success", "data": { "txstatus": "1", "externalref": "..." } }

        const event = req.body;

        if (event.status === 'success' && event.data && event.data.txstatus === '1') {
            const externalRef = event.data.externalref;

            console.log(`✅ Moolre Payment Successful: ${externalRef}`);

            // TODO: Here you would parse the externalRef or look up the transaction in your DB
            // to find the recipientPhone and bundleSize.
            // Since we are stateless here, we can't easily deliver without a DB lookup.
            // HOWEVER, we can extract it if we encoded it in the ref, OR (better) just log strictly for now.
            // Unlike Paystack metadata, Moolre relies on us tracking the 'externalref'.

            // Assuming we stored the order in a DB, we would fetch it here.

            /*
            const order = {
                id: externalRef,
                network: 'Moolre MoMo',
                status: 'Completed'
            };
            await deliverBundle(order);
            */

            return res.status(200).json({ status: 'ok' });
        }

        res.status(200).send('Webhook processed');
    } catch (error) {
        console.error('Moolre Webhook Error:', error);
        res.status(500).json({ error: error.message });
    }
}
