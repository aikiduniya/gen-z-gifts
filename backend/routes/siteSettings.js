const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

// Default payment accounts
const defaultPaymentAccounts = [
  {
    method: 'Bank Transfer',
    details: [
      { label: 'Bank', value: 'Meezan Bank' },
      { label: 'Account Title', value: 'GenZ Gifts' },
      { label: 'Account No', value: '0123456789012' },
      { label: 'IBAN', value: 'PK36MEZN0001234567890123' },
    ],
  },
  {
    method: 'EasyPaisa',
    details: [
      { label: 'Account Title', value: 'GenZ Gifts' },
      { label: 'Account No', value: '03001234567' },
    ],
  },
  {
    method: 'JazzCash',
    details: [
      { label: 'Account Title', value: 'GenZ Gifts' },
      { label: 'Account No', value: '03001234567' },
    ],
  },
];

router.get('/site-settings', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM site_settings LIMIT 1');
    if (rows.length === 0) {
    return res.json({
        store_name: 'GenZGifts',
        email: 'info@genzgifts.com',
        phone: '',
        address: '',
        instagram_url: '',
        tiktok_id: '',
        header_script: '',
        body_script: '',
        footer_script: '',
        payment_accounts: defaultPaymentAccounts
    });
    }
    // Parse payment_accounts JSON if it's a string
    const settings = rows[0];
    if (settings.payment_accounts && typeof settings.payment_accounts === 'string') {
        try {
            settings.payment_accounts = JSON.parse(settings.payment_accounts);
        } catch (e) {
            settings.payment_accounts = defaultPaymentAccounts;
        }
    }
    // Use default if empty
    if (!settings.payment_accounts || settings.payment_accounts.length === 0) {
        settings.payment_accounts = defaultPaymentAccounts;
    }
    res.json(settings);
} catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.put('/site-settings', async (req, res) => {
try {
    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify the token and check admin role
    const token = authHeader.split(' ')[1];
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Query the user_roles table to check if user has admin role
        const [roleRows] = await pool.execute('SELECT role FROM user_roles WHERE user_id = ?', [decoded.userId]);
        const isAdmin = roleRows.some(r => r.role === 'admin');
        
        if (!isAdmin) {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
    } catch (jwtError) {
        console.error('JWT or DB error:', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
    }

    const { store_name, email, phone, address, instagram_url, tiktok_id, header_script, body_script, footer_script, payment_accounts } = req.body;
    const paymentAccountsJson = JSON.stringify(payment_accounts || defaultPaymentAccounts);
    const [existing] = await pool.execute('SELECT id FROM site_settings LIMIT 1');
    if (existing.length === 0) {
    // Insert new settings
    const id = crypto.randomUUID();
    await pool.execute(
        'INSERT INTO site_settings (id, store_name, email, phone, address, instagram_url, tiktok_id, header_script, body_script, footer_script, payment_accounts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, store_name, email, phone, address, instagram_url, tiktok_id, header_script || '', body_script || '', footer_script || '', paymentAccountsJson]
    );
    res.json({ id, store_name, email, phone, address, instagram_url, tiktok_id, header_script: header_script || '', body_script: body_script || '', footer_script: footer_script || '', payment_accounts: payment_accounts || defaultPaymentAccounts });
    } else {
    // Update existing
    await pool.execute(
        'UPDATE site_settings SET store_name = ?, email = ?, phone = ?, address = ?, instagram_url = ?, tiktok_id = ?, header_script = ?, body_script = ?, footer_script = ?, payment_accounts = ?',
        [store_name, email, phone, address, instagram_url, tiktok_id, header_script || '', body_script || '', footer_script || '', paymentAccountsJson]
    );
    const [rows] = await pool.execute('SELECT * FROM site_settings LIMIT 1');
    const settings = rows[0];
    if (settings.payment_accounts && typeof settings.payment_accounts === 'string') {
        try {
            settings.payment_accounts = JSON.parse(settings.payment_accounts);
        } catch (e) {
            settings.payment_accounts = defaultPaymentAccounts;
        }
    }
    res.json(settings);
    }
} catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

module.exports = router;
