const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const emailService = require('../services/emailService');

const router = express.Router();

router.post('/orders', async (req, res) => {
try {
const { customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_zip, shipping_country, items, payment_screenshot, coupon_code, discount_amount } = req.body;
    
    // Get undelivered order quantities for all products in cart
    const productIds = items.map(item => item.product_id);
    const placeholders = productIds.map(() => '?').join(',');
    const [undeliveredRows] = await pool.execute(
    `SELECT oi.product_id, SUM(oi.quantity) as undelivered_qty FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status != 'delivered' AND oi.product_id IN (${placeholders}) GROUP BY oi.product_id`,
    productIds
    );
    
    const undeliveredQuantities = new Map(undeliveredRows.map(row => [row.product_id, row.undelivered_qty || 0]));

    // Validate stock for each item
    for (const item of items) {
    const [productRows] = await pool.execute('SELECT stock FROM products WHERE id = ? AND is_active = 1', [item.product_id]);
    if (productRows.length === 0) {
        return res.status(400).json({ error: `Product ${item.product_name} is no longer available.` });
    }
    const undeliveredQty = undeliveredQuantities.get(item.product_id) || 0;
    const availableStock = productRows[0].stock - undeliveredQty;
    if (availableStock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.product_name}. Only ${availableStock} available (considering undelivered orders).` });
    }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping_cost = subtotal >= 5000 ? 0 : 99;
    const discount = discount_amount || 0;
    const total = subtotal + shipping_cost - discount;

    const orderNumber = 'ORD-' + Date.now();
    const orderId = crypto.randomUUID();
    
    const [result] = await pool.execute(
    'INSERT INTO orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_zip, shipping_country, subtotal, shipping_cost, discount_amount, coupon_code, total, status, payment_screenshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [orderId, orderNumber, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_zip, shipping_country, subtotal, shipping_cost, discount, coupon_code || null, total, 'pending', payment_screenshot || null]
    );
    
    // Insert order items
    for (const item of items) {
    await pool.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, parseInt(item.product_id), item.product_name, item.price, item.quantity]
    );
    }

    // Decrement stock for each product
    for (const item of items) {
    await pool.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
    );
    }

    // Send order confirmation email (async, don't wait)
    const orderItems = items.map(item => ({
        name: item.product_name,
        price: item.price,
        quantity: item.quantity
    }));
    
    const shippingDetails = {
        address: shipping_address,
        city: shipping_city,
        zip: shipping_zip,
        country: shipping_country
    };
    
    emailService.sendOrderConfirmationEmail(
        customer_email,
        customer_name,
        orderNumber,
        orderItems,
        shippingDetails,
        subtotal,
        shipping_cost,
        total,
        coupon_code || null,
        discount
    ).then(success => {
        if (success) {
            console.log(`Order confirmation email sent for order ${orderNumber}`);
        }
    }).catch(emailError => {
        console.error('Error sending order confirmation email:', emailError);
    });

    res.json({ orderId, orderNumber });
} catch (error) {
    console.error('Create order error:', error);
    if (error.sqlMessage && (error.sqlMessage.includes('foreign key constraint') || error.sqlMessage.includes('Cannot add or update a child row'))) {
    res.status(400).json({ error: 'Some products in your cart are no longer available. Please update your cart and try again.' });
    } else {
    res.status(500).json({ error: 'Internal server error' });
    }
}
});

router.get('/orders', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
} catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.get('/orders/:id', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
} catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.put('/orders/:id', async (req, res) => {
try {
    const { status, stripe_payment_id } = req.body;
    const updates = [];
    const values = [];

    // Get current order status before update to detect status change to 'delivered'
    const [currentOrder] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (currentOrder.length === 0) return res.status(404).json({ error: 'Order not found' });
    const previousStatus = currentOrder[0].status;

    if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
    }
    if (stripe_payment_id !== undefined) {
    updates.push('stripe_payment_id = ?');
    values.push(stripe_payment_id);
    }

    if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const [result] = await pool.execute(
    `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
    values
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    // Send review request email when status changes to 'delivered'
    if (status === 'delivered' && previousStatus !== 'delivered') {
        const order = rows[0];
        // Fetch order items with product details (including image_url)
        const [orderItems] = await pool.execute(
            `SELECT oi.product_id, oi.product_name, oi.quantity, p.image_url 
             FROM order_items oi 
             LEFT JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [req.params.id]
        );

        // Format products for email
        const products = orderItems.map(item => ({
            id: item.product_id,
            name: item.product_name,
            image_url: item.image_url || ''
        }));

        // Send review request email (async, don't wait)
        emailService.sendReviewRequestEmail(
            order.customer_email,
            order.customer_name,
            order.order_number,
            products
        ).then(success => {
            if (success) {
                console.log(`Review request email sent for order ${order.order_number}`);
            }
        }).catch(emailError => {
            console.error('Error sending review request email:', emailError);
        });
    }

    res.json(rows[0]);
} catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.delete('/orders/:id', async (req, res) => {
try {
    const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
} catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

module.exports = router;
