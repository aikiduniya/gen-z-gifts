const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /categories - Get all categories (for admin)
router.get('/categories', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT id, name, is_active, created_at FROM categories ORDER BY name');
    res.json(rows);
} catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

// GET /categories/list - Get active categories for frontend (with 'All')
router.get('/categories/list', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT name FROM categories WHERE is_active = 1 ORDER BY name');
    const categories = ['All', ...rows.map(row => row.name)];
    res.json(categories);
} catch (error) {
    console.error('Get categories list error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

// POST /categories - Create new category
router.post('/categories', async (req, res) => {
const { name, is_active = true } = req.body;
if (!name?.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
}
try {
    const [result] = await pool.execute(
    'INSERT INTO categories (name, is_active) VALUES (?, ?)',
    [name.trim(), is_active]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), is_active, created_at: new Date() });
} catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Category name already exists' });
    } else {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
    }
}
});

// PUT /categories/:id - Update category
router.put('/categories/:id', async (req, res) => {
const { id } = req.params;
const { name, is_active } = req.body;
if (!name?.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
}
try {
    const [result] = await pool.execute(
    'UPDATE categories SET name = ?, is_active = ? WHERE id = ?',
    [name.trim(), is_active, id]
    );
    if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ id, name: name.trim(), is_active });
} catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Category name already exists' });
    } else {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
    }
}
});

// DELETE /categories/:id - Delete category
router.delete('/categories/:id', async (req, res) => {
const { id } = req.params;
try {
    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
} catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

module.exports = router;
