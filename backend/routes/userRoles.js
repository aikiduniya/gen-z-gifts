const express = require('express');
const crypto = require('crypto');
const pool = require('../db');


const router = express.Router();

router.get('/user-roles', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM user_roles ORDER BY id');
    res.json(rows);
} catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.post('/user-roles', async (req, res) => {
try {
    const { user_id, role } = req.body;
    const id = crypto.randomUUID();
    const [result] = await pool.execute(
    'INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)',
    [id, user_id, role]
    );
    res.json({ id, user_id, role });
} catch (error) {
    console.error('Create user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.put('/user-roles/:id', async (req, res) => {
try {
    const { user_id, role } = req.body;
    const [result] = await pool.execute(
    'UPDATE user_roles SET user_id = ?, role = ? WHERE id = ?',
    [user_id, role, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Role not found' });
    const [rows] = await pool.execute('SELECT * FROM user_roles WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
} catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.delete('/user-roles/:id', async (req, res) => {
try {
    const [result] = await pool.execute('DELETE FROM user_roles WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Role not found' });
    res.json({ success: true });
} catch (error) {
    console.error('Delete user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

module.exports = router;
