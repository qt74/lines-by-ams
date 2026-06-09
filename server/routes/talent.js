const express = require('express');
const router  = express.Router();
const {
  getAllTalent, getTalent, createTalent, updateTalent, deleteTalent, getMyTalent
} = require('../controllers/talentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get ('/',        getAllTalent);
router.get ('/my',      protect, authorize('agency'), getMyTalent);
router.get ('/:id',     getTalent);
router.post('/',        protect, authorize('agency'), upload.single('photo'), createTalent);
router.put ('/:id',     protect, authorize('agency'), upload.single('photo'), updateTalent);
router.delete('/:id',  protect, authorize('agency'), deleteTalent);

module.exports = router;
