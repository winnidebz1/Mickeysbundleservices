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
        console.log(`📊 GET /api/orders - Returning ${pendingOrders.length} orders`);
        return res.status(200).json({
            success: true,
            orders: pendingOrders,
            count: pendingOrders.length
        });
    }

    if (req.method === 'POST') {
        const { action, orderId, order } = req.body;
        console.log(`📝 POST /api/orders - Action: ${action}`, { orderId, order });

        if (action === 'complete') {
            // Mark order as completed
            const beforeCount = pendingOrders.length;
            pendingOrders = pendingOrders.filter(o => o.id !== orderId);
            const afterCount = pendingOrders.length;
            console.log(`✅ Order ${orderId} marked as completed. Orders: ${beforeCount} → ${afterCount}`);
            return res.status(200).json({
                success: true,
                message: 'Order marked as completed'
            });
        }

        if (action === 'add') {
            // Add new pending order (called from webhook)
            if (!order) {
                console.error('❌ No order data provided');
                return res.status(400).json({ error: 'Order data required' });
            }

            // Check if order already exists
            const exists = pendingOrders.some(o => o.id === order.id);
            if (exists) {
                console.log(`⚠️ Order ${order.id} already exists, skipping`);
                return res.status(200).json({
                    success: true,
                    message: 'Order already exists'
                });
            }

            pendingOrders.push(order);
            console.log(`✅ Order ${order.id} added. Total orders: ${pendingOrders.length}`);
            console.log(`📦 Order details:`, order);
            return res.status(200).json({
                success: true,
                message: 'Order added to pending list',
                totalOrders: pendingOrders.length
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
