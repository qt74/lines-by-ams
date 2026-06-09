const express = require('express');
const router  = express.Router();
const { register, login, getMe, updateMe, initAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',   register);
router.post('/login',      login);
router.post('/init-admin', initAdmin); // dev only — creates first admin
router.get ('/me',       protect, getMe);
router.put ('/me',       protect, updateMe);

module.exports = router;
