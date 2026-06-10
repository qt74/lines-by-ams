const User       = require('../models/User');
const Agency     = require('../models/Agency');
const Employment = require('../models/Employment');

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
    const [totalUsers, totalAgencies, totalEmployments, completedEmployments] = await Promise.all([
      User.countDocuments(),
      Agency.countDocuments({ isApproved: true }),
      Employment.countDocuments(),
      Employment.countDocuments({ status: 'Completed' }),
    ]);

    // Sum platform commission from completed employments
    const revenueData = await Employment.aggregate([
      { $match: { status: { $in: ['Full Payment Received', 'Employment Commenced', 'Completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$platformFee' }, totalVolume: { $sum: '$agreedSalary' } } },
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, totalVolume: 0 };

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAgencies,
        totalEmployments,
        completedEmployments,
        totalRevenue: revenue.totalRevenue,
        totalVolume:  revenue.totalVolume,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
