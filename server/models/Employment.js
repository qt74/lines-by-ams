const mongoose = require('mongoose');

const STATUSES = [
  'Contact Initiated',
  'Interview Scheduled',
  'Down-payment Received',
  'Government Paperwork Initiated',
  'Government Paperwork In Progress',
  'Government Paperwork Finalized',
  'Ready for Full Payment',
  'Full Payment Received',
  'Employment Commenced',
  'Completed',
  'Cancelled',
];

const EmploymentSchema = new mongoose.Schema({
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',          required: true },
  agency:        { type: mongoose.Schema.Types.ObjectId, ref: 'Agency',        required: true },
  talent:        { type: mongoose.Schema.Types.ObjectId, ref: 'TalentProfile', required: true },

  contractType:  { type: String, enum: ['Yearly', 'Monthly', 'Hourly'], required: true },
  agreedSalary:  { type: Number },           // QAR — set when both parties agree
  platformFee:   { type: Number, default: 0 }, // 10% commission
  agencyPayout:  { type: Number, default: 0 }, // 90% to agency

  status: {
    type: String,
    enum: STATUSES,
    default: 'Contact Initiated',
  },

  statusHistory: [{
    status:    { type: String, enum: STATUSES },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:      { type: String },
    timestamp: { type: Date, default: Date.now },
  }],

  downPaymentConfirmed:  { type: Boolean, default: false },
  downPaymentDate:       { type: Date },

  stripePaymentIntentId: { type: String },
  fullPaymentDate:       { type: Date },

  notes: { type: String },
}, { timestamps: true });

// Auto-calculate fees when agreedSalary is set (sync hook — no next() needed)
EmploymentSchema.pre('save', function () {
  if (this.agreedSalary && this.agreedSalary > 0) {
    this.platformFee  = Math.round(this.agreedSalary * 0.10);
    this.agencyPayout = this.agreedSalary - this.platformFee;
  }
});

module.exports = mongoose.model('Employment', EmploymentSchema);
