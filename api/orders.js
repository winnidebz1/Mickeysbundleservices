import { kv } from '@vercel/kv';

// Persistent storage using Vercel KV (Redis)
const ORDERS_KEY = 'orders:all';

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            // Get all orders from KV storage
            const orders = await kv.get(ORDERS_KEY) || [];
            console.log(`📊 GET /api/orders - Returning ${orders.length} orders`);

            return res.status(200).json({
                success: true,
                orders: orders,
                count: orders.length
            });
        } catch (error) {
            console.error('❌ Error fetching orders:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch orders',
                orders: [],
                count: 0
            });
        }
    }

    if (req.method === 'POST') {
        const { action, orderId, order } = req.body;
        console.log(`📝 POST /api/orders - Action: ${action}`, { orderId, order });

        try {
            // Get current orders
            let orders = await kv.get(ORDERS_KEY) || [];

            if (action === 'complete') {
                // Mark order as completed (remove from pending)
                const beforeCount = orders.length;
                orders = orders.filter(o => o.id !== orderId);
                await kv.set(ORDERS_KEY, orders);

                const afterCount = orders.length;
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
                const exists = orders.some(o => o.id === order.id);
                if (exists) {
                    console.log(`⚠️ Order ${order.id} already exists, skipping`);
                    return res.status(200).json({
                        success: true,
                        message: 'Order already exists'
                    });
                }

                // Add order to the beginning of the array
                orders.unshift(order);
                await kv.set(ORDERS_KEY, orders);

                console.log(`✅ Order ${order.id} added. Total orders: ${orders.length}`);
                console.log(`📦 Order details:`, order);

                return res.status(200).json({
                    success: true,
                    message: 'Order added to pending list',
                    totalOrders: orders.length
                });
            }
        } catch (error) {
            console.error('❌ Error processing order:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to process order'
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
