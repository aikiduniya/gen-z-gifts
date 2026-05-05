const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

// Track a new visitor
router.post('/visitors', async (req, res) => {
  try {
    const { page_url, referrer, country, city, user_agent, session_id } = req.body;

    const id = crypto.randomUUID();

    await pool.execute(
      'INSERT INTO visitors (id, page_url, referrer, country, city, user_agent, session_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, page_url || '', referrer || '', country || '', city || '', user_agent || '', session_id || '']
    );

    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Track visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visitors with optional date range filter
router.get('/visitors', async (req, res) => {
  try {
    const { date_range } = req.query;

    let query = 'SELECT * FROM visitors';
    const params = [];

    if (date_range === '7d') {
      query += ' WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (date_range === '30d') {
      query += ' WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visitor stats (summary)
router.get('/visitors/stats', async (req, res) => {
  try {
    const { date_range } = req.query;

    let whereClause = '';
    const params = [];

    if (date_range === '7d') {
      whereClause = ' WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (date_range === '30d') {
      whereClause = ' WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    // Total page views
    const [countResult] = await pool.execute(`SELECT COUNT(*) as total FROM visitors${whereClause}`, params);
    
    // Unique sessions
    const [sessionResult] = await pool.execute(`SELECT COUNT(DISTINCT session_id) as unique_sessions FROM visitors${whereClause}`, params);

    // Unique countries
    const [countryResult] = await pool.execute(`SELECT COUNT(DISTINCT country) as unique_countries FROM visitors${whereClause} AND country != ''`, params);

    res.json({
      totalViews: countResult[0].total,
      uniqueSessions: sessionResult[0].unique_sessions,
      uniqueCountries: countryResult[0].unique_countries
    });
  } catch (error) {
    console.error('Get visitor stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

