const Employment    = require('../models/Employment');
const TalentProfile = require('../models/TalentProfile');
const Agency        = require('../models/Agency');
const stripe        = require('stripe')(process.env.STRIPE_SECRET_KEY);

const AGENCY_ADVANCE = [
  'Interview Scheduled',
  'Down-payment Received',
  'Government Paperwork Initiated',
  'Government Paperwork In Progress',
  'Government Paperwork Finalized',
  'Employment Commenced',
  'Completed',
  'Cancelled',
];

// @desc  Customer sends contact/hire request
// @route POST /api/employment
exports.createEmployment = async (req, res) => {
  try {
    const { talentId, contractType, notes } = req.body;

    const talent = await TalentProfile.findById(talentId).populate('agency');
    if (!talent)         return res.status(404).json({ success: false, message: 'Talent not found' });
    if (!talent.isActive) return res.status(400).json({ success: false, message: 'Talent not available' });

    // Prevent duplicate active requests
    const duplicate = await Employment.findOne({
      customer: req.user._id,
      talent:   talentId,
      status:   { $nin: ['Completed', 'Cancelled'] },
    });
    if (duplicate) return res.status(400).json({ success: false, message: 'You already have an active request for this talent' });

    const employment = await Employment.create({
      customer:     req.user._id,
      agency:       talent.agency._id,
      talent:       talentId,
      contractType,
      notes,
      statusHistory: [{ status: 'Contact Initiated', updatedBy: req.user._id }],
    });

    res.status(201).json({ success: true, employment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get customer's employments
// @route GET /api/employment/my
exports.getMyEmployments = async (req, res) => {
  try {
    const employments = await Employment.find({ customer: req.user._id })
      .populate('talent', 'name photo skills')
      .populate('agency', 'agencyName logo')
      .sort({ updatedAt: -1 });
    res.json({ success: true, employments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get agency's incoming employments
// @route GET /api/employment/agency
exports.getAgencyEmployments = async (req, res) => {
  try {
    const agency = await Agency.findOne({ user: req.user._id });
    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });

    const employments = await Employment.find({ agency: agency._id })
      .populate('customer', 'name email phone')
      .populate('talent', 'name photo skills')
      .sort({ updatedAt: -1 });
    res.json({ success: true, employments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single employment (customer or agency)
// @route GET /api/employment/:id
exports.getEmployment = async (req, res) => {
  try {
    const employment = await Employment.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('talent', 'name photo skills contractTypes salaryRange')
      .populate('agency', 'agencyName logo user');

    if (!employment) return res.status(404).json({ success: false, message: 'Employment not found' });

    // Access check
    const isCustomer = String(employment.customer._id) === String(req.user._id);
    const agencyUser = employment.agency.user;
    const isAgency   = String(agencyUser) === String(req.user._id);
    const isAdmin    = req.user.role === 'admin';

    if (!isCustomer && !isAgency && !isAdmin)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, employment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Agency updates employment status
// @route PATCH /api/employment/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, note, agreedSalary } = req.body;
    const agency = await Agency.findOne({ user: req.user._id });
    const employment = await Employment.findById(req.params.id).populate('agency');

    if (!employment) return res.status(404).json({ success: false, message: 'Employment not found' });
    if (String(employment.agency._id) !== String(agency._id))
      return res.status(403).json({ success: false, message: 'Not your employment' });
    if (!AGENCY_ADVANCE.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status for agency' });

    employment.status = status;
    employment.statusHistory.push({ status, updatedBy: req.user._id, note });

    if (agreedSalary) employment.agreedSalary = agreedSalary;

    // Auto-advance: when paperwork finalized → ready for full payment
    if (status === 'Government Paperwork Finalized') {
      employment.status = 'Ready for Full Payment';
      employment.statusHistory.push({ status: 'Ready for Full Payment', updatedBy: req.user._id, note: 'Auto-advanced' });
    }

    await employment.save();
    res.json({ success: true, employment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Customer confirms simulated down-payment
// @route PATCH /api/employment/:id/downpayment
exports.confirmDownPayment = async (req, res) => {
  try {
    const employment = await Employment.findById(req.params.id);
    if (!employment) return res.status(404).json({ success: false, message: 'Employment not found' });
    if (String(employment.customer) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not your employment' });

    employment.downPaymentConfirmed = true;
    employment.downPaymentDate      = new Date();
    employment.status               = 'Down-payment Received';
    employment.statusHistory.push({ status: 'Down-payment Received', updatedBy: req.user._id, note: 'Simulated down-payment confirmed' });
    await employment.save();

    res.json({ success: true, employment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Create Stripe payment intent for full payment
// @route POST /api/employment/:id/payment
exports.createPaymentIntent = async (req, res) => {
  try {
    const employment = await Employment.findById(req.params.id);
    if (!employment) return res.status(404).json({ success: false, message: 'Employment not found' });
    if (String(employment.customer) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not your employment' });
    if (employment.status !== 'Ready for Full Payment')
      return res.status(400).json({ success: false, message: 'Not ready for full payment yet' });
    if (!employment.agreedSalary)
      return res.status(400).json({ success: false, message: 'Agreed salary not set yet' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   employment.agreedSalary * 100,   // Stripe uses smallest currency unit (halalas)
      currency: 'qar',
      metadata: { employmentId: String(employment._id) },
    });

    employment.stripePaymentIntentId = paymentIntent.id;
    await employment.save();

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Stripe webhook — marks full payment received
// @route POST /api/employment/webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const employment = await Employment.findOne({ stripePaymentIntentId: pi.id });
    if (employment) {
      employment.status          = 'Full Payment Received';
      employment.fullPaymentDate = new Date();
      employment.statusHistory.push({ status: 'Full Payment Received', note: 'Stripe webhook confirmed' });

      // Update agency earnings
      const Agency = require('../models/Agency');
      await Agency.findByIdAndUpdate(employment.agency, {
        $inc: { totalPlacements: 1, totalEarned: employment.agencyPayout },
      });

      await employment.save();
    }
  }
  res.json({ received: true });
};
