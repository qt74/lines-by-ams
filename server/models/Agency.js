const mongoose = require('mongoose');

const AgencySchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  agencyName:  { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  logo:        { type: String, default: '' },
  website:     { type: String, trim: true },
  socialLinks: {
    instagram: { type: String },
    whatsapp:  { type: String },
  },
  isPremium:          { type: Boolean, default: false },
  premiumExpiresAt:   { type: Date },
  isApproved:         { type: Boolean, default: false },  // admin must approve
  totalPlacements:    { type: Number, default: 0 },
  totalEarned:        { type: Number, default: 0 },       // QAR after platform commission
}, { timestamps: true });

module.exports = mongoose.model('Agency', AgencySchema);
