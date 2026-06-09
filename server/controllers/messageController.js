const Message    = require('../models/Message');
const Employment = require('../models/Employment');
const Agency     = require('../models/Agency');

// @desc  Send a message
// @route POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { employmentId, content } = req.body;

    const employment = await Employment.findById(employmentId).populate('agency');
    if (!employment) return res.status(404).json({ success: false, message: 'Employment not found' });

    // Determine receiver
    const isCustomer = String(employment.customer) === String(req.user._id);
    const agencyUserId = employment.agency.user;
    const isAgency   = String(agencyUserId) === String(req.user._id);

    if (!isCustomer && !isAgency)
      return res.status(403).json({ success: false, message: 'Not part of this employment' });

    const receiverId = isCustomer ? agencyUserId : employment.customer;

    const message = await Message.create({
      employment: employmentId,
      sender:     req.user._id,
      receiver:   receiverId,
      content,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get messages for an employment
// @route GET /api/messages/:employmentId
exports.getMessages = async (req, res) => {
  try {
    const employment = await Employment.findById(req.params.employmentId).populate('agency');
    if (!employment) return res.status(404).json({ success: false, message: 'Employment not found' });

    const isCustomer = String(employment.customer) === String(req.user._id);
    const isAgency   = String(employment.agency.user) === String(req.user._id);
    if (!isCustomer && !isAgency)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const messages = await Message.find({ employment: req.params.employmentId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { employment: req.params.employmentId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
