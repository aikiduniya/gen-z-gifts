const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

// GET /reviews - Get all reviews with product and order info
router.get('/reviews', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.order_id,
        o.order_number,
        r.product_id,
        p.name as product_name,
        p.image_url as product_image,
        r.customer_email,
        r.rating,
        r.review_text,
        r.created_at
      FROM reviews r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /reviews/product/:productId - Get reviews for a specific product
router.get('/reviews/product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    
    const query = `
      SELECT 
        r.id,
        r.order_id,
        o.order_number,
        r.product_id,
        p.name as product_name,
        p.image_url as product_image,
        r.customer_email,
        r.rating,
        r.review_text,
        r.created_at
      FROM reviews r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.execute(query, [productId]);
    
    // Calculate average rating and review count
    let averageRating = 0;
    let reviewCount = 0;
    
    if (rows.length > 0) {
      const totalRating = rows.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / rows.length;
      reviewCount = rows.length;
    }
    
    res.json({
      reviews: rows,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /reviews/:id - Get a single review by ID
router.get('/reviews/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.order_id,
        o.order_number,
        r.product_id,
        p.name as product_name,
        p.image_url as product_image,
        r.customer_email,
        r.rating,
        r.review_text,
        r.created_at
      FROM reviews r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.id = ?
    `;
    const [rows] = await pool.execute(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /reviews - Create a new review
router.post('/reviews', async (req, res) => {
  try {
    const { order_number, product_id, customer_email, rating, review_text } = req.body;

    // Validate required fields
    if (!product_id || !customer_email || !rating) {
      return res.status(400).json({ error: 'Product ID, customer email, and rating are required' });
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Look up the actual order ID from order_number if provided
    let orderId = null;
    if (order_number) {
      const [orderRows] = await pool.execute(
        'SELECT id FROM orders WHERE order_number = ?',
        [order_number]
      );
      if (orderRows.length > 0) {
        orderId = orderRows[0].id;
      }
    }

    const id = crypto.randomUUID();
    const [result] = await pool.execute(
      'INSERT INTO reviews (id, order_id, product_id, customer_email, rating, review_text) VALUES (?, ?, ?, ?, ?, ?)',
      [id, orderId, product_id, customer_email, rating, review_text || null]
    );

    const [rows] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: rows[0]
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /reviews/:id - Delete a review by ID
router.delete('/reviews/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
