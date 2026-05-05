const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all banners (public - only active, ordered)
router.get('/banners/list', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all banners (admin - all)
router.get('/banners', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const [rows] = await pool.execute('SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create banner
router.post('/banners', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { title, subtitle, image_url, link_url, is_active, sort_order } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO banners (title, subtitle, image_url, link_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title || '', subtitle || '', image_url || '', link_url || '', is_active !== undefined ? is_active : 1, sort_order || 0]
    );
    const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update banner
router.put('/banners/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { id } = req.params;
    const { title, subtitle, image_url, link_url, is_active, sort_order } = req.body;
    await pool.execute(
      'UPDATE banners SET title=?, subtitle=?, image_url=?, link_url=?, is_active=?, sort_order=? WHERE id=?',
      [title || '', subtitle || '', image_url || '', link_url || '', is_active !== undefined ? is_active : 1, sort_order || 0, id]
    );
    const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete banner
router.delete('/banners/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { id } = req.params;
    await pool.execute('DELETE FROM banners WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
