const express = require('express');
const router  = express.Router();
const {
  getUsers, toggleUser, updateUser, deleteUser,
  getAgencies, approveAgency, togglePremium,
  getStats, getEmployments,
  adminGetShops, adminUpdateShop, adminDeleteShop,
  adminGetProducts, adminDeleteProduct,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// Stats
router.get   ('/stats',               getStats);

// Users
router.get   ('/users',               getUsers);
router.patch ('/users/:id/toggle',    toggleUser);
router.put   ('/users/:id',           updateUser);
router.delete('/users/:id',           deleteUser);

// Agencies (legacy)
router.get   ('/agencies',                  getAgencies);
router.patch ('/agencies/:id/approve',      approveAgency);
router.patch ('/agencies/:id/premium',      togglePremium);
router.get   ('/employments',               getEmployments);

// Shops
router.get   ('/shops',               adminGetShops);
router.put   ('/shops/:id',           adminUpdateShop);
router.delete('/shops/:id',           adminDeleteShop);

// Products
router.get   ('/products',            adminGetProducts);
router.delete('/products/:id',        adminDeleteProduct);

module.exports = router;
