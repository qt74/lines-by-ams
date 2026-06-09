const Agency = require('../models/Agency');

// @desc  Get all approved agencies (public — used for Browse filter dropdown)
// @route GET /api/agencies
exports.getAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find({ isApproved: true })
      .select('agencyName logo description isPremium totalPlacements')
      .sort({ isPremium: -1, agencyName: 1 });
    res.json({ success: true, agencies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update own agency profile
// @route PUT /api/agencies/profile
exports.updateAgencyProfile = async (req, res) => {
  try {
    const agency = await Agency.findOne({ user: req.user._id });
    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });

    const { agencyName, description, website } = req.body;
    const updateData = {};

    if (agencyName)                  updateData.agencyName   = agencyName;
    if (description !== undefined)   updateData.description  = description;
    if (website     !== undefined)   updateData.website      = website;
    if (req.file)                    updateData.logo         = `/uploads/${req.file.filename}`;

    // socialLinks: accept JSON string or object
    if (req.body.socialLinks) {
      try {
        updateData.socialLinks = typeof req.body.socialLinks === 'string'
          ? JSON.parse(req.body.socialLinks)
          : req.body.socialLinks;
      } catch (_) { /* ignore malformed JSON */ }
    }

    const updated = await Agency.findByIdAndUpdate(agency._id, updateData, { new: true, runValidators: true });
    res.json({ success: true, agency: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get own agency profile
// @route GET /api/agencies/profile
exports.getAgencyProfile = async (req, res) => {
  try {
    const agency = await Agency.findOne({ user: req.user._id });
    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });
    res.json({ success: true, agency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
