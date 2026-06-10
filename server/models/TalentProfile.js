const mongoose = require('mongoose');

const TalentProfileSchema = new mongoose.Schema({
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },

  // Basic Info
  name:     { type: String, required: true, trim: true },
  photo:    { type: String, default: '' },
  bio:      { type: String, trim: true },
  location: { type: String, trim: true },
  phone:    { type: String, trim: true },

  // Skills & Work
  skills: [{
    type: String,
    enum: [
      'Model', 'Stylist', 'Photographer', 'Videographer',
      'Makeup Artist', 'Hair Stylist', 'Fashion Designer',
      'Seamstress / Tailor', 'Textile Artist', 'Wardrobe Manager',
      'Brand Ambassador', 'Social Media Influencer', 'Art Director',
      'Fashion Illustrator', 'Pattern Maker',
      'Boutique Owner', 'Retail Buyer', 'Visual Merchandiser'
    ]
  }],

  contractTypes: [{
    type: String,
    enum: ['Yearly', 'Monthly', 'Hourly']
  }],

  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'QAR' }
  },

  experience:   { type: Number, default: 0 },   // years
  availability: { type: String, enum: ['Available', 'Booked', 'Unavailable'], default: 'Available' },
  portfolio:    [{ type: String }],              // array of image URLs

  // Arabic fields
  nameAr: { type: String, trim: true },
  bioAr:  { type: String, trim: true },

  isActive:  { type: Boolean, default: true },
  views:     { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TalentProfile', TalentProfileSchema);
