const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db');

// GET /coupons - List all coupons (admin only)
router.get('/coupons', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM coupons ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// POST /coupons - Create a new coupon (admin only)
router.post('/coupons', async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_uses,
      is_active,
      valid_from,
      valid_until
    } = req.body;

    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ error: 'Code, discount type, and discount value are required' });
    }

    // Validate discount_type
    if (!['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: 'Discount type must be either percentage or fixed' });
    }

    // Validate discount_value
    const discountValue = parseFloat(discount_value);
    if (isNaN(discountValue) || discountValue <= 0) {
      return res.status(400).json({ error: 'Discount value must be a positive number' });
    }

    // For percentage type, validate it's not more than 100
    if (discount_type === 'percentage' && discountValue > 100) {
      return res.status(400).json({ error: 'Percentage discount cannot exceed 100%' });
    }

    // Generate UUID for the coupon
    const id = crypto.randomUUID();
    const couponCode = code.toUpperCase().trim();
    const minOrderAmount = parseFloat(min_order_amount) || 0;
    const maxUses = parseInt(max_uses) || 100;
    const isActive = is_active !== undefined ? (is_active ? 1 : 0) : 1;

    await pool.execute(
      `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_uses, is_active, valid_from, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        couponCode,
        description || '',
        discount_type,
        discountValue,
        minOrderAmount,
        maxUses,
        isActive,
        valid_from || null,
        valid_until || null
      ]
    );

    // Fetch the created coupon
    const [rows] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create coupon error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'A coupon with this code already exists' });
    }
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// PUT /coupons/:id - Update a coupon (admin only)
router.put('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_uses,
      is_active,
      valid_from,
      valid_until
    } = req.body;

    // Check if coupon exists
    const [existing] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Validate discount_type if provided
    if (discount_type && !['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: 'Discount type must be either percentage or fixed' });
    }

    // Validate discount_value if provided
    if (discount_value !== undefined) {
      const discountValue = parseFloat(discount_value);
      if (isNaN(discountValue) || discountValue <= 0) {
        return res.status(400).json({ error: 'Discount value must be a positive number' });
      }
      if (discount_type === 'percentage' && discountValue > 100) {
        return res.status(400).json({ error: 'Percentage discount cannot exceed 100%' });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    if (code !== undefined) {
      updates.push('code = ?');
      values.push(code.toUpperCase().trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (discount_type !== undefined) {
      updates.push('discount_type = ?');
      values.push(discount_type);
    }
    if (discount_value !== undefined) {
      updates.push('discount_value = ?');
      values.push(parseFloat(discount_value));
    }
    if (min_order_amount !== undefined) {
      updates.push('min_order_amount = ?');
      values.push(parseFloat(min_order_amount));
    }
    if (max_uses !== undefined) {
      updates.push('max_uses = ?');
      values.push(parseInt(max_uses));
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    if (valid_from !== undefined) {
      updates.push('valid_from = ?');
      values.push(valid_from || null);
    }
    if (valid_until !== undefined) {
      updates.push('valid_until = ?');
      values.push(valid_until || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await pool.execute(
      `UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch the updated coupon
    const [rows] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Update coupon error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'A coupon with this code already exists' });
    }
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// DELETE /coupons/:id - Delete a coupon (admin only)
router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if coupon exists
    const [existing] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// POST /coupons/validate - Validate coupon for checkout
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const couponCode = code.toUpperCase().trim();

    // Find the coupon
    const [rows] = await pool.execute(
      'SELECT * FROM coupons WHERE code = ?',
      [couponCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    const coupon = rows[0];

    // Check if coupon is active
    if (!coupon.is_active) {
      return res.status(400).json({ error: 'This coupon is no longer active' });
    }

    // Check if coupon has reached max uses
    if (coupon.current_uses >= coupon.max_uses) {
      return res.status(400).json({ error: 'This coupon has reached its usage limit' });
    }

    // Check if coupon is still valid (date range)
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return res.status(400).json({ error: 'This coupon is not yet valid' });
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return res.status(400).json({ error: 'This coupon has expired' });
    }

    // Check minimum order amount
    const orderAmountValue = parseFloat(orderAmount) || 0;
    if (orderAmountValue < coupon.min_order_amount) {
      return res.status(400).json({ 
        error: `Minimum order amount of Rs. ${coupon.min_order_amount} required for this coupon` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderAmountValue * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmountValue);

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discountAmount,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// POST /coupons/use - Increment coupon usage after successful order
router.post('/coupons/use', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const couponCode = code.toUpperCase().trim();

    // Find and update the coupon
    const [result] = await pool.execute(
      'UPDATE coupons SET current_uses = current_uses + 1 WHERE code = ?',
      [couponCode]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({ message: 'Coupon usage recorded' });
  } catch (error) {
    console.error('Use coupon error:', error);
    res.status(500).json({ error: 'Failed to record coupon usage' });
  }
});

module.exports = router;
