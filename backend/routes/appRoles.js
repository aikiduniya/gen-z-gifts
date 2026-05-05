const express = require('express');

const router = express.Router();

router.get('/app-roles', (req, res) => {
res.json(['admin', 'user']);
});

module.exports = router;
