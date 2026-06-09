/**
 * Seed script — creates the initial Super Admin user.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * Override credentials via env:
 *   ADMIN_NAME="Super Admin" ADMIN_EMAIL=admin@fashionmission.qa ADMIN_PASS=Secure123! node scripts/seedAdmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const ADMIN_NAME  = process.env.ADMIN_NAME  || 'Super Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fashionmission.qa';
const ADMIN_PASS  = process.env.ADMIN_PASS  || 'Admin@FM2024!';

// ── Inline User schema (avoids circular require issues) ──────────────────────
const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['customer', 'agency', 'admin'], default: 'customer' },
    phone:    String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ── Connect ──────────────────────────────────────────────────────────────────
async function run() {
  let mongoServer;
  let uri = process.env.MONGO_URI;

  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    console.log('⚠  No MONGO_URI — using in-memory MongoDB (admin will be lost on restart).');
    console.log('   Set MONGO_URI in .env to persist the admin account.\n');
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ Upgraded existing user "${ADMIN_EMAIL}" to admin role.`);
    } else {
      console.log(`ℹ  Admin "${ADMIN_EMAIL}" already exists — nothing to do.`);
    }
  } else {
    const admin = new User({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASS, role: 'admin' });
    await admin.save();
    console.log('\n🎉 Admin user created!');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASS}`);
    console.log('\n⚠  Change the password after first login!\n');
  }

  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
