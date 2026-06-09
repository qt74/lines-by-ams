const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  employment: { type: mongoose.Schema.Types.ObjectId, ref: 'Employment', required: true },
  sender:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
  receiver:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
  content:    { type: String, required: true, trim: true },
  isRead:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
