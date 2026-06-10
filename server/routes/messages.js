const express = require('express');
const router  = express.Router();
const { sendMessage, getMessages, getInbox } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get ('/',               protect, getInbox);
router.post('/',               protect, sendMessage);
router.get ('/:employmentId',  protect, getMessages);

module.exports = router;
