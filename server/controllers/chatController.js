const axios = require('axios');

// ── Platform knowledge base (used both as AI context AND for FAQ matching) ────
const PLATFORM_CONTEXT = `
You are the friendly support assistant for "Lines By AMS" — a fashion talent marketplace based in Qatar.

ABOUT THE PLATFORM:
- Lines By AMS connects fashion talent (models, designers, photographers, makeup artists, boutique owners, etc.) with clients/employers in Qatar and the GCC region.
- The platform is available in English and Arabic (RTL supported).
- All pricing is in QAR (Qatari Riyal).
- Website: https://dynamic-eclair-b04019.netlify.app

USER ROLES:
1. Customer / Employer: Can browse talent, send hire requests, track orders, message agencies, pay via Stripe.
2. Agency: Registers talent on the platform, manages hire requests, communicates with clients. Must be approved by admin before listing talent.
3. Admin: Manages the platform — approves agencies, manages users, views stats.

HOW TO REGISTER:
- Go to /register, choose your role (Customer or Agency).
- Agencies must provide an agency name and description. After registration, wait for admin approval before listing talent.
- Customers can browse and hire immediately after registering.

HOW TO HIRE TALENT (Customer flow):
1. Browse talent at /browse — filter by skill, location, salary, contract type, experience.
2. Click a talent card to view their full profile, portfolio, and skills.
3. Click "Hire This Talent" (must be logged in as customer).
4. Fill in contract type (Yearly/Monthly/Hourly) and any notes, then submit.
5. The agency receives your request and will accept or reject it.
6. Once accepted, the process moves through stages: Interview Scheduled → Paperwork → Employment Commenced → Completed.
7. Payment is processed via Stripe when the agency sets the agreed salary.
8. Track everything at /dashboard.

TALENT CATEGORIES / SKILLS:
Model, Stylist, Photographer, Videographer, Makeup Artist, Hair Stylist, Fashion Designer,
Seamstress / Tailor, Textile Artist, Wardrobe Manager, Brand Ambassador, Social Media Influencer,
Art Director, Fashion Illustrator, Pattern Maker, Boutique Owner, Retail Buyer, Visual Merchandiser.

CONTRACT TYPES: Yearly, Monthly, Hourly.

FOR AGENCIES:
- Register at /register choosing "Agency" role.
- After admin approval, log in and go to /agency/dashboard.
- Add talent profiles with photos, portfolio images, skills, salary range, bio.
- Manage incoming hire requests — Accept or Reject them.
- Advance the status through the pipeline and set agreed salary.
- Communicate with clients via the built-in messaging system.
- Premium agencies get a gold star (⭐) badge and appear first in search results.

MESSAGING:
- Customers and agencies can message each other within a hire request.
- Access messages at /messages (available after logging in).
- The chat is linked to specific hire requests.

PAYMENTS:
- The platform charges a 10% commission on agreed salaries.
- Agencies receive 90% of the agreed salary.
- Payments are processed securely via Stripe.
- If Stripe is not yet configured on the live site, contact admin at hello@linesbyams.qa.

PLATFORM FEES & PRICING:
- Browsing talent is completely free.
- No subscription fee for customers.
- Agencies pay a 10% platform commission only when a hire is completed.
- Premium agency listing is available (contact admin).

CONTACT:
- Email: hello@linesbyams.qa
- Instagram: @linesbyams
- WhatsApp: +974 1234 5678
- For technical issues, email hello@linesbyams.qa with subject "Support".

COMMON QUESTIONS:
Q: How long does agency approval take? A: Typically 1-2 business days. You'll be able to list talent once approved.
Q: Can I cancel a hire request? A: Yes, before the agency accepts. After acceptance, contact the agency via messages.
Q: What if I'm not satisfied with a talent? A: Message the agency through the platform. The admin can also be contacted at hello@linesbyams.qa.
Q: How do I upload a portfolio? A: Go to /agency/dashboard, click Edit on a talent profile, scroll to Portfolio Gallery and upload images.
Q: Is my payment secure? A: Yes. All payments go through Stripe, a PCI-DSS certified payment processor. Lines By AMS never stores card details.
Q: Can I search in Arabic? A: Yes. Toggle the language using the "ع" button in the navbar. Talent profiles also have Arabic names and bios.

Be helpful, concise (2-4 sentences max per answer), friendly and professional. If you don't know something specific, direct the user to hello@linesbyams.qa.
`;

// ── Simple FAQ keyword matcher (used when no AI key is configured) ─────────
const FAQ = [
  {
    keys: ['register','sign up','create account','join'],
    answer: 'To register, click **Register** in the top menu. Choose your role — **Customer** (to hire talent) or **Agency** (to list talent). Agencies need admin approval before listing, which takes 1-2 business days.',
  },
  {
    keys: ['login','log in','sign in','password'],
    answer: 'Click **Login** in the navbar and enter your email and password. Forgot your password? Contact us at **hello@linesbyams.qa** and we\'ll reset it for you.',
  },
  {
    keys: ['hire','book','order','request','contact talent'],
    answer: 'To hire talent: **Browse** → click a talent card → click **"Hire This Talent"** → choose contract type and add notes → Submit. The agency will accept or reject your request. Track it all at **/dashboard**.',
  },
  {
    keys: ['browse','search','find','filter','skill','category'],
    answer: 'Go to **/browse** to search talent. You can filter by **skill** (Model, Designer, Photographer, Boutique Owner, etc.), **location**, **salary range**, **contract type**, **experience**, and **agency**.',
  },
  {
    keys: ['payment','pay','price','cost','fee','stripe','salary','qar'],
    answer: 'Browsing is **free**. The platform charges a **10% commission** on agreed salaries — agencies receive 90%. Payments are processed securely via **Stripe**. Pricing is in QAR (Qatari Riyal).',
  },
  {
    keys: ['agency','boutique','list talent','add talent','dashboard'],
    answer: 'Agencies register at **/register** (choose Agency role), wait for admin approval, then manage talent at **/agency/dashboard**. You can add talent profiles, portfolio images, and manage hire requests from there.',
  },
  {
    keys: ['message','chat','talk','contact','communicate'],
    answer: 'Once a hire request is created, you and the agency can message each other. Click **💬 Messages** in the navbar to open your inbox. Messages are tied to specific hire requests.',
  },
  {
    keys: ['status','track','order status','progress','pipeline','stage'],
    answer: 'Track your hire at **/dashboard**. The stages are: Contact Initiated → Interview Scheduled → Government Paperwork → Employment Commenced → Completed. The agency advances the status and you\'re notified at each step.',
  },
  {
    keys: ['portfolio','photo','gallery','image','upload'],
    answer: 'Agencies can upload portfolio images when editing a talent profile. Go to **/agency/dashboard** → Edit talent → scroll down to **Portfolio Gallery** → click "Add Images". Supports JPG, PNG, WebP up to 5MB each.',
  },
  {
    keys: ['premium','star','featured','gold','badge'],
    answer: '⭐ **Premium agencies** appear first in search results and have a gold badge on their talent cards. Premium status is granted by the admin. Contact **hello@linesbyams.qa** to inquire.',
  },
  {
    keys: ['arabic','language','rtl','ar','عربي'],
    answer: 'Lines By AMS supports **Arabic**! Click the **"ع"** button in the top navbar to switch to Arabic (right-to-left). Talent profiles also have Arabic name and bio fields.',
  },
  {
    keys: ['cancel','refund','reject','withdraw'],
    answer: 'You can cancel a hire request before the agency accepts it by contacting us. After acceptance, message the agency directly via the platform. For disputes, email **hello@linesbyams.qa**.',
  },
  {
    keys: ['approve','approval','pending','agency approval'],
    answer: 'After registering as an agency, admin reviews your profile within **1-2 business days**. Once approved, you\'ll be able to log in and start listing talent on **/agency/dashboard**.',
  },
  {
    keys: ['contact','support','help','email','whatsapp','instagram'],
    answer: 'Reach us at:\n📧 **hello@linesbyams.qa**\n📱 WhatsApp: **+974 1234 5678**\n📸 Instagram: **@linesbyams**\n\nWe typically respond within 24 hours.',
  },
  {
    keys: ['boutique','boutique owner','retail','buyer','merchandiser'],
    answer: 'Lines By AMS features **Boutique** professionals including **Boutique Owners**, **Retail Buyers**, and **Visual Merchandisers**. Browse them at /browse and filter by skill → Boutique Owner.',
  },
  {
    keys: ['what is','about','platform','linesbyams','lines by ams','how does it work'],
    answer: '**Lines By AMS** is a fashion talent marketplace based in **Qatar** 🇶🇦. We connect fashion professionals (models, designers, photographers, boutique owners and more) with clients across the GCC. Browse talent, send hire requests, and manage the full process — all in one place.',
  },
];

function matchFAQ(message) {
  const lower = message.toLowerCase();
  for (const item of FAQ) {
    if (item.keys.some(k => lower.includes(k))) {
      return item.answer;
    }
  }
  return null;
}

// ── AI-powered response via Anthropic Claude ──────────────────────────────
async function getAIResponse(message, history) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_key') return null;

  try {
    // Build messages array from history
    const messages = [
      ...(history || []).slice(-8).map(h => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      'claude-haiku-4-5',
        max_tokens: 400,
        system:     PLATFORM_CONTEXT,
        messages,
      },
      {
        headers: {
          'x-api-key':         apiKey,
          'anthropic-version': '2023-06-01',
          'content-type':      'application/json',
        },
        timeout: 15000,
      }
    );

    return response.data?.content?.[0]?.text || null;
  } catch (err) {
    console.error('[chat] AI error:', err.response?.data || err.message);
    return null;
  }
}

// ── Controller ────────────────────────────────────────────────────────────
// @route POST /api/chat
exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let reply = null;

    // 1. Try AI first (if configured)
    reply = await getAIResponse(message.trim(), history);

    // 2. Fall back to FAQ keyword matching
    if (!reply) {
      reply = matchFAQ(message.trim());
    }

    // 3. Generic fallback
    if (!reply) {
      reply = "I'm not sure about that specific question. For detailed help, please email us at **hello@linesbyams.qa** or WhatsApp **+974 1234 5678** — we typically respond within 24 hours! 😊";
    }

    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, reply: 'Sorry, something went wrong. Please try again or contact hello@linesbyams.qa.' });
  }
};
