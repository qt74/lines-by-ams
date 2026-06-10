const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  shop:        { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  name:        { type: String, required: true, trim: true },
  nameAr:      { type: String, trim: true },
  description: { type: String, trim: true },
  descriptionAr:{ type: String, trim: true },

  price:       { type: Number, required: true, min: 0 },
  currency:    { type: String, default: 'QAR' },
  comparePrice:{ type: Number },          // original price (for sale display)

  images:      [{ type: String }],        // array of image URLs
  category:    { type: String, trim: true },
  tags:        [{ type: String }],

  inStock:     { type: Boolean, default: true },
  quantity:    { type: Number, default: null },   // null = unlimited

  isActive:    { type: Boolean, default: true },
  views:       { type: Number,  default: 0 },
  orders:      { type: Number,  default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
