const TalentProfile = require('../models/TalentProfile');
const Agency        = require('../models/Agency');

// @desc  Get all talent (public, with filters)
// @route GET /api/talent
exports.getAllTalent = async (req, res) => {
  try {
    const { skill, contract, location, minSalary, maxSalary, availability, search, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    if (skill)         query.skills        = skill;
    if (contract)      query.contractTypes = contract;
    if (location)      query.location      = { $regex: location, $options: 'i' };
    if (availability)  query.availability  = availability;
    if (minSalary)     query['salaryRange.min'] = { $gte: Number(minSalary) };
    if (maxSalary)     query['salaryRange.max'] = { $lte: Number(maxSalary) };
    if (search)        query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { nameAr:{ $regex: search, $options: 'i' } },
      { bio:   { $regex: search, $options: 'i' } },
    ];

    const total  = await TalentProfile.countDocuments(query);
    const talent = await TalentProfile.find(query)
      .populate('agency', 'agencyName logo isPremium')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), talent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single talent profile
// @route GET /api/talent/:id
exports.getTalent = async (req, res) => {
  try {
    const talent = await TalentProfile.findById(req.params.id)
      .populate('agency', 'agencyName logo description socialLinks isPremium user');
    if (!talent) return res.status(404).json({ success: false, message: 'Talent not found' });

    // Increment view count
    talent.views += 1;
    await talent.save();

    res.json({ success: true, talent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Create talent profile (agency only)
// @route POST /api/talent
exports.createTalent = async (req, res) => {
  try {
    const agency = await Agency.findOne({ user: req.user._id });
    if (!agency) return res.status(404).json({ success: false, message: 'Agency profile not found' });
    if (!agency.isApproved) return res.status(403).json({ success: false, message: 'Agency not yet approved by admin' });

    const talent = await TalentProfile.create({ ...req.body, agency: agency._id });
    res.status(201).json({ success: true, talent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update talent profile (agency owner only)
// @route PUT /api/talent/:id
exports.updateTalent = async (req, res) => {
  try {
    const agency  = await Agency.findOne({ user: req.user._id });
    const talent  = await TalentProfile.findById(req.params.id);
    if (!talent)  return res.status(404).json({ success: false, message: 'Talent not found' });
    if (String(talent.agency) !== String(agency._id))
      return res.status(403).json({ success: false, message: 'Not your talent profile' });

    const updated = await TalentProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, talent: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete talent profile (agency owner only)
// @route DELETE /api/talent/:id
exports.deleteTalent = async (req, res) => {
  try {
    const agency = await Agency.findOne({ user: req.user._id });
    const talent = await TalentProfile.findById(req.params.id);
    if (!talent) return res.status(404).json({ success: false, message: 'Talent not found' });
    if (String(talent.agency) !== String(agency._id))
      return res.status(403).json({ success: false, message: 'Not your talent profile' });

    await talent.deleteOne();
    res.json({ success: true, message: 'Talent profile deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get my agency's talent profiles
// @route GET /api/talent/my
exports.getMyTalent = async (req, res) => {
  try {
    const agency = await Agency.findOne({ user: req.user._id });
    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });

    const talent = await TalentProfile.find({ agency: agency._id }).sort({ createdAt: -1 });
    res.json({ success: true, talent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
