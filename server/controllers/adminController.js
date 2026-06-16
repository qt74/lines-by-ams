const User       = require('../models/User');
const Agency     = require('../models/Agency');
const Employment = require('../models/Employment');
const Shop       = require('../models/Shop');
const Product    = require('../models/Product');
const mailer     = require('../utils/mailer');

// @desc  Get all users
// @route GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle user active/suspended
// @route PATCH /api/admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all agencies (pending + approved)
// @route GET /api/admin/agencies
exports.getAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, agencies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Approve / reject an agency
// @route PATCH /api/admin/agencies/:id/approve
exports.approveAgency = async (req, res) => {
  try {
    const { approved } = req.body;
    const agency = await Agency.findByIdAndUpdate(req.params.id, { isApproved: approved }, { new: true });
    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });
    mailer.onAgencyApproved(agency, approved); // notify owner (fire-and-forget)
    res.json({ success: true, agency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle agency premium status
// @route PATCH /api/admin/agencies/:id/premium
exports.togglePremium = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.id);
    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });
    agency.isPremium = !agency.isPremium;
    if (agency.isPremium) {
      // Set premium expiry to 1 year from now by default
      agency.premiumExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else {
      agency.premiumExpiresAt = null;
    }
    await agency.save();
    res.json({ success: true, agency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get platform stats
// @route GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalShops, totalProducts, featuredShops] = await Promise.all([
      User.countDocuments(),
      Shop.countDocuments({ isActive: true }),
      Product.countDocuments(),
      Shop.countDocuments({ isPremium: true }),
    ]);
    res.json({ success: true, totalUsers, totalShops, totalProducts, featuredShops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── User CRUD ─────────────────────────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Shop admin CRUD ───────────────────────────────────────────────────────────
exports.adminGetShops = async (req, res) => {
  try {
    const shops = await Shop.find()
      .populate('owner', 'name email')
      .populate('productCount')
      .sort({ createdAt: -1 });
    res.json({ success: true, shops });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.adminUpdateShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('owner', 'name email');
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    res.json({ success: true, shop });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.adminDeleteShop = async (req, res) => {
  try {
    await Shop.findByIdAndDelete(req.params.id);
    await Product.deleteMany({ shop: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Product admin CRUD ────────────────────────────────────────────────────────
exports.adminGetProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('shop', 'name')
      .populate('owner', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.adminDeleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc  Get all employments
// @route GET /api/admin/employments
exports.getEmployments = async (req, res) => {
  try {
    const employments = await Employment.find()
      .populate('customer', 'name email')
      .populate('talent', 'name photo')
      .populate('agency', 'agencyName')
      .sort({ updatedAt: -1 });
    res.json({ success: true, employments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
