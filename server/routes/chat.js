const express    = require('express');
const router     = express.Router();
const { chat }   = require('../controllers/chatController');

// Public — no auth required so visitors can ask questions too
router.post('/', chat);

module.exports = router;
