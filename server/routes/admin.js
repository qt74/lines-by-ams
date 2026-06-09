const express = require('express');
const router  = express.Router();
const {
  getUsers, toggleUser, getAgencies, approveAgency, getStats, getEmployments
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get   ('/stats',               getStats);
router.get   ('/users',               getUsers);
router.patch ('/users/:id/toggle',    toggleUser);
router.get   ('/agencies',            getAgencies);
router.patch ('/agencies/:id/approve', approveAgency);
router.get   ('/employments',         getEmployments);

module.exports = router;
