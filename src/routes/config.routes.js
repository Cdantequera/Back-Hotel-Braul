const express = require('express');
const router = express.Router();

const { getConfig, updateConfig } = require('../controllers/config.controller');
const { verifyAuth, verifyAdmin } = require('../middlewares/auth');

// GET público - lo usan Footer y Contact sin login
router.get('/', getConfig);

// PUT solo admin
router.put('/', verifyAuth, verifyAdmin, updateConfig);

module.exports = router;