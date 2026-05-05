const express = require('express');
const pool = require('../db');

const router = express.Router();

// Public endpoint - no auth required
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, order_number, customer_name, status, shipping_city, shipping_country, subtotal, shipping_cost, discount_amount, coupon_code, total, created_at, updated_at FROM orders WHERE order_number = ?',
      [req.params.orderNumber]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = rows[0];

    // Get order items
    const [items] = await pool.execute(
      'SELECT product_name, price, quantity FROM order_items WHERE order_id = ?',
      [order.id]
    );

    res.json({ ...order, items });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
