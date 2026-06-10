const express = require('express');
const router  = express.Router();
const { getShops, getShop, createShop, updateShop, getMyShop } = require('../controllers/shopController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get ('/',       getShops);
router.get ('/my',     protect, getMyShop);
router.get ('/:id',    getShop);
router.post('/',       protect, upload.fields([{ name:'logo', maxCount:1 }, { name:'cover', maxCount:1 }]), createShop);
router.put ('/:id',    protect, upload.fields([{ name:'logo', maxCount:1 }, { name:'cover', maxCount:1 }]), updateShop);

module.exports = router;
