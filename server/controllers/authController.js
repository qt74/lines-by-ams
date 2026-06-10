const User          = require('../models/User');
const Agency        = require('../models/Agency');
const generateToken = require('../utils/generateToken');

// @desc  Register user (customer or agency)
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location, agencyName, description } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    // Only allow customer or agency roles on self-registration
    const allowedRoles = ['customer', 'agency'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Validate agency-specific fields BEFORE creating user
    if (role === 'agency' && !agencyName) {
      return res.status(400).json({ success: false, message: 'Agency name required' });
    }

    const user = await User.create({ name, email, password, role, phone, location });

    // If registering as agency, create agency profile
    let agencyProfile = null;
    if (role === 'agency') {
      agencyProfile = await Agency.create({ user: user._id, agencyName, description: description || '' });
    }

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, agency: agencyProfile },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Login
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended' });

    const token = generateToken(user._id);

    // Attach agency profile if applicable
    let agencyProfile = null;
    if (user.role === 'agency') {
      agencyProfile = await Agency.findOne({ user: user._id });
    }

    res.json({
      success: true,
      token,
      user: {
        _id:     user._id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        avatar:  user.avatar,
        agency:  agencyProfile,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let agencyProfile = null;
    if (user.role === 'agency') {
      agencyProfile = await Agency.findOne({ user: user._id });
    }
    res.json({ success: true, user: { ...user.toObject(), agency: agencyProfile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Dev-only: create first admin if none exists
// @route POST /api/auth/init-admin
exports.initAdmin = async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ success: false, message: 'Only available in development' });
  }
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists. Use /login.' });
    }
    const { name = 'Super Admin', email = 'admin@linesbyams.qa', password = 'Admin@FM2024!' } = req.body;
    const admin = await User.create({ name, email, password, role: 'admin' });
    const token = generateToken(admin._id);
    res.status(201).json({
      success: true,
      message: 'Admin created! Change the password immediately.',
      token,
      user: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update profile
// @route PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, location, lang } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, location, lang },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
