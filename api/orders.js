// Simple in-memory storage for pending orders
// In production, you'd use a database
let pendingOrders = [];

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        // Return all pending orders
        return res.status(200).json({
            success: true,
            orders: pendingOrders,
            count: pendingOrders.length
        });
    }

    if (req.method === 'POST') {
        const { action, orderId } = req.body;

        if (action === 'complete') {
            // Mark order as completed
            pendingOrders = pendingOrders.filter(order => order.id !== orderId);
            return res.status(200).json({
                success: true,
                message: 'Order marked as completed'
            });
        }

        if (action === 'add') {
            // Add new pending order (called from webhook)
            const { order } = req.body;
            pendingOrders.push(order);
            return res.status(200).json({
                success: true,
                message: 'Order added to pending list'
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
