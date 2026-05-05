const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/order-items', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM order_items ORDER BY id');
    res.json(rows);
} catch (error) {
    console.error('Get order items error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.get('/order-items/:id', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM order_items WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order item not found' });
    res.json(rows[0]);
} catch (error) {
    console.error('Get order item error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.post('/order-items', async (req, res) => {
try {
    const { order_id, product_id, product_name, price, quantity } = req.body;
    const [result] = await pool.execute(
    'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
    [order_id, product_id, product_name, price, quantity]
    );
    const newItem = {
    id: result.insertId,
    order_id,
    product_id,
    product_name,
    price,
    quantity,
    };
    res.json(newItem);
} catch (error) {
    console.error('Create order item error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.put('/order-items/:id', async (req, res) => {
try {
    const { quantity } = req.body;
    const [result] = await pool.execute(
    'UPDATE order_items SET quantity = ? WHERE id = ?',
    [quantity, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order item not found' });
    const [rows] = await pool.execute('SELECT * FROM order_items WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
} catch (error) {
    console.error('Update order item error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.delete('/order-items/:id', async (req, res) => {
try {
    const [result] = await pool.execute('DELETE FROM order_items WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order item not found' });
    res.json({ success: true });
} catch (error) {
    console.error('Delete order item error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

module.exports = router;