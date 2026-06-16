/**
 * Owner notification emails.
 *
 * Sends a short email to the platform owner when key events happen
 * (new signup, login, agency approval). Designed to be SAFE:
 *   - If SMTP isn't configured, it logs instead of throwing.
 *   - Every send is fire-and-forget and fully wrapped in try/catch, so a
 *     mail failure can NEVER break login/registration/approval.
 *
 * Configure via environment variables (set these on Render):
 *   SMTP_HOST      e.g. smtp.gmail.com
 *   SMTP_PORT      e.g. 465 (SSL) or 587 (TLS)
 *   SMTP_USER      the sending mailbox (e.g. your Gmail address)
 *   SMTP_PASS      an app password (NOT your normal password)
 *   OWNER_EMAIL    where notifications are delivered (defaults below)
 *   MAIL_FROM      optional "From" header (defaults to SMTP_USER)
 */
const nodemailer = require('nodemailer');

const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.SEED_ADMIN_EMAIL || '';

let transporter = null;
let warned = false;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // SSL on 465, STARTTLS otherwise
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

/**
 * Send an owner notification. Never throws.
 * @param {string} subject
 * @param {string} text  plain-text body
 */
async function notifyOwner(subject, text) {
  try {
    const tx = getTransporter();
    if (!tx || !OWNER_EMAIL) {
      if (!warned) {
        console.log('[mail] SMTP/OWNER_EMAIL not configured — logging notifications instead of sending.');
        warned = true;
      }
      console.log(`[mail] (would send) → ${OWNER_EMAIL || 'OWNER_EMAIL unset'} | ${subject}`);
      return;
    }
    await tx.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: OWNER_EMAIL,
      subject: `[Lines By AMS] ${subject}`,
      text,
    });
    console.log(`[mail] sent → ${OWNER_EMAIL} | ${subject}`);
  } catch (err) {
    console.error('[mail] send failed (non-fatal):', err.message);
  }
}

/** Fire-and-forget wrapper so callers never need to await. */
function notifyOwnerAsync(subject, text) {
  notifyOwner(subject, text).catch(() => {});
}

const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

module.exports = {
  notifyOwnerAsync,
  onSignup: (user) => notifyOwnerAsync(
    'New account created',
    `A new ${user.role} account was created.\n\nName: ${user.name}\nEmail: ${user.email}\nTime: ${stamp()}`,
  ),
  onLogin: (user) => notifyOwnerAsync(
    'User logged in',
    `A user just logged in.\n\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nTime: ${stamp()}`,
  ),
  onAgencyApproved: (agency, approved) => notifyOwnerAsync(
    approved ? 'Agency approved' : 'Agency approval revoked',
    `Agency "${agency.agencyName}" was ${approved ? 'approved' : 'set to not approved'}.\nTime: ${stamp()}`,
  ),
};
