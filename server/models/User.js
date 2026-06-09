const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['customer', 'agency', 'admin'], default: 'customer' },
  phone:    { type: String, trim: true },
  location: { type: String, trim: true },
  avatar:   { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lang:     { type: String, enum: ['en', 'ar'], default: 'en' },
}, { timestamps: true });

// Hash password before save (Mongoose 6+: async hooks — do NOT call next())
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
