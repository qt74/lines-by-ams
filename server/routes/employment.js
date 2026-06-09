const express = require('express');
const router  = express.Router();
const {
  createEmployment, getMyEmployments, getAgencyEmployments,
  getEmployment, updateStatus, confirmDownPayment, createPaymentIntent, stripeWebhook
} = require('../controllers/employmentController');
const { protect, authorize } = require('../middleware/auth');

// Stripe webhook must use raw body — mounted before express.json() in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.post('/',               protect, authorize('customer'), createEmployment);
router.get ('/my',             protect, authorize('customer'), getMyEmployments);
router.get ('/agency',         protect, authorize('agency'),   getAgencyEmployments);
router.get ('/:id',            protect, getEmployment);
router.patch('/:id/status',    protect, authorize('agency'),   updateStatus);
router.patch('/:id/downpayment', protect, authorize('customer'), confirmDownPayment);
router.post ('/:id/payment',   protect, authorize('customer'), createPaymentIntent);

module.exports = router;
