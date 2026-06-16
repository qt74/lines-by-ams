const express = require('express');
const rateLimit = require('express-rate-limit');
const router  = express.Router();
const { register, login, getMe, updateMe, initAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Brute-force protection: cap repeated login/register attempts per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,            // 15 minutes
  max: 10,                             // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,        // only failed attempts count
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
});

router.post('/register',   authLimiter, register);
router.post('/login',      authLimiter, login);
router.post('/init-admin', initAdmin); // dev only — creates first admin
router.get ('/me',       protect, getMe);
router.put ('/me',       protect, updateMe);

module.exports = router;
