const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const sessions = {};

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const router = express.Router();

// Login
router.post('/auth/login', async (req, res) => {
try {
    const { email, password } = req.body;
    const [rows] = await pool.execute('SELECT id, email, password FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
    return res.status(400).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
    return res.status(400).json({ error: 'Invalid credentials' });
    }

    const [roleRows] = await pool.execute('SELECT role FROM user_roles WHERE user_id = ?', [user.id]);
    const isAdmin = roleRows.some(r => r.role === 'admin');

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ user: { id: user.id, email: user.email }, isAdmin, session: { access_token: token } });
} catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

// Register
router.post('/auth/register', async (req, res) => {
try {
    const { email, password } = req.body;
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
    return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    const userId = result.insertId;
    res.json({ user: { id: userId, email } });
} catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

// Logout
router.post('/auth/logout', async (req, res) => {
const token = req.headers.authorization?.split(' ')[1];
if (token) delete sessions[token];
res.json({ message: 'Logged out' });
});

// Get user
router.get('/auth/user', async (req, res) => {
const token = req.headers.authorization?.split(' ')[1];
if (!token) return res.status(401).json({ error: 'Not authenticated' });

try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.execute('SELECT id, email FROM users WHERE id = ?', [decoded.userId]);
    if (rows.length === 0) {
    return res.status(401).json({ error: 'User not found' });
    }
    const user = rows[0];

    const [roleRows] = await pool.execute('SELECT role FROM user_roles WHERE user_id = ?', [user.id]);
    const isAdmin = roleRows.some(r => r.role === 'admin');

    res.json({ user: { id: user.id, email: user.email }, isAdmin });
} catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
}
});

// Verify OTP (mock)
router.post('/auth/verify-otp', async (req, res) => {
const { email, otp } = req.body;
// Mock OTP verification - always succeed for demo
if (otp === '123456') {
    res.json({ success: true });
} else {
    res.status(400).json({ error: 'Invalid OTP' });
}
});

module.exports = router;