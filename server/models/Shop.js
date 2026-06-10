const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  nameAr:      { type: String, trim: true },
  description: { type: String, trim: true },
  descriptionAr:{ type: String, trim: true },
  category:    { type: String, trim: true, default: 'Fashion' },
  logo:        { type: String, default: '' },
  coverImage:  { type: String, default: '' },
  phone:       { type: String, trim: true },
  whatsapp:    { type: String, trim: true },
  instagram:   { type: String, trim: true },
  location:    { type: String, trim: true, default: 'Qatar' },
  paymentMethods: { type: [String], default: ['cash', 'apple_pay', 'visa'] },

  isApproved:  { type: Boolean, default: true },  // auto-approve for now
  isPremium:   { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },

  totalSales:  { type: Number, default: 0 },
  views:       { type: Number, default: 0 },
}, { timestamps: true });

// Virtual: product count
ShopSchema.virtual('productCount', {
  ref: 'Product', localField: '_id', foreignField: 'shop', count: true,
});
ShopSchema.set('toObject', { virtuals: true });
ShopSchema.set('toJSON',   { virtuals: true });

module.exports = mongoose.model('Shop', ShopSchema);
