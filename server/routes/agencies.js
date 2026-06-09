const express  = require('express');
const router   = express.Router();
const {
  getAgencies,
  getAgencyProfile,
  updateAgencyProfile,
} = require('../controllers/agencyController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/',         getAgencies);

// Agency self-service (protected)
router.get ('/profile', protect, authorize('agency'), getAgencyProfile);
router.put ('/profile', protect, authorize('agency'), upload.single('logo'), updateAgencyProfile);

module.exports = router;
