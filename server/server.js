require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const connectDB  = require('./config/db');
const seedDatabase = require('./seed');
const sanitize   = require('./middleware/sanitize');

// ─── Fail fast on weak/missing secrets in production ──────
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET must be set and at least 32 characters in production.');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI must be set in production (in-memory DB is dev-only).');
    process.exit(1);
  }
} else if (!process.env.JWT_SECRET) {
  // Dev convenience: never run with an undefined secret (would forge with "undefined").
  process.env.JWT_SECRET = 'dev_only_insecure_secret_change_me_please_32chars';
  console.warn('[security] No JWT_SECRET set — using an insecure dev default.');
}

// Connect to MongoDB, then seed sample data if the DB is empty
connectDB().then(() => seedDatabase());

const app = express();

// ─── Security ────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  skip: () => process.env.NODE_ENV === 'development',
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── CORS ─────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ─── Stripe webhook (raw body — must come BEFORE express.json) ────
app.use('/api/employment/webhook', express.raw({ type: 'application/json' }));

// ─── Body parsing (capped to prevent large-payload DoS) ───
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── NoSQL-injection sanitization (strips $ and . from body/params) ───
app.use(sanitize);

// ─── Static uploads ───────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Logger (dev only) ────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/talent',     require('./routes/talent'));
app.use('/api/agencies',   require('./routes/agencies'));
app.use('/api/employment', require('./routes/employment'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/chat',       require('./routes/chat'));
app.use('/api/shops',      require('./routes/shops'));
app.use('/api/products',   require('./routes/products'));

// ─── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', env: process.env.NODE_ENV }));

// ─── 404 ──────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  // Don't leak internal error details to clients on 5xx in production.
  const isServerError = status >= 500;
  const message = (isServerError && process.env.NODE_ENV === 'production')
    ? 'Something went wrong. Please try again.'
    : (err.message || 'Server Error');
  res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Lines By AMS API running on port ${PORT} [${process.env.NODE_ENV}]`));
