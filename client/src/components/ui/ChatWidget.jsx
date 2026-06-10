import { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';

// ── Quick-reply suggestion chips ─────────────────────────────────────────────
const SUGGESTIONS = [
  { label: '👋 What is this platform?',  msg: 'What is Lines By AMS?' },
  { label: '🛍️ How to hire talent?',      msg: 'How do I hire talent?' },
  { label: '💰 Pricing & fees',           msg: 'What are the fees and pricing?' },
  { label: '🏢 Register as agency',       msg: 'How do I register as an agency?' },
  { label: '📦 Track my order',           msg: 'How do I track my hire request status?' },
  { label: '💬 Messaging',                msg: 'How does messaging work?' },
  { label: '📞 Contact support',          msg: 'How can I contact support?' },
];

// ── Client-side FAQ knowledge base (works with NO backend) ───────────────────
const FAQ = [
  {
    keys: ['what is','about','platform','linesbyams','lines by ams','how does it work'],
    answer: '**Lines By AMS** is a fashion talent marketplace based in **Qatar** 🇶🇦. We connect fashion professionals (models, designers, photographers, boutique owners and more) with clients across the GCC. Browse talent, send hire requests, and manage the full process — all in one place.',
  },
  {
    keys: ['register','sign up','create account','join'],
    answer: 'To register, click **Get Started** in the top menu. Choose your role — **Customer** (to hire talent) or **Agency** (to list talent). Agencies need admin approval before listing, which takes 1-2 business days.',
  },
  {
    keys: ['login','log in','sign in','password'],
    answer: 'Click **Sign In** in the navbar and enter your email and password. Forgot your password? Contact us at **hello@linesbyams.qa** and we\'ll reset it for you.',
  },
  {
    keys: ['hire','book','order','request','contact talent'],
    answer: 'To hire talent: go to **Browse Talent** → click a talent card → click **"Hire This Talent"** → choose contract type and add notes → Submit. The agency will accept or reject your request. Track everything from your **/dashboard**.',
  },
  {
    keys: ['browse','search','find','filter','skill','category'],
    answer: 'Go to **Browse Talent** to search. Filter by **skill** (Model, Designer, Photographer, Boutique Owner, etc.), **location**, **salary range**, **contract type**, **experience**, and **agency**.',
  },
  {
    keys: ['payment','pay','price','cost','fee','stripe','salary','qar'],
    answer: 'Browsing is completely **free**. The platform charges a **10% commission** on agreed salaries — agencies receive 90%. Payments are processed securely via **Stripe**. All pricing is in **QAR (Qatari Riyal)**.',
  },
  {
    keys: ['agency','boutique','list talent','add talent'],
    answer: 'Agencies register at **/register** (choose Agency role), wait for admin approval (1-2 days), then manage talent at **/agency/dashboard**. Add talent profiles with photos, portfolio, skills, salary range, and bio.',
  },
  {
    keys: ['message','chat','talk','communicate','inbox'],
    answer: 'Once a hire request is created, you and the agency can message each other. Click **💬 Messages** in the navbar to open your inbox. Messages are linked to each specific hire request.',
  },
  {
    keys: ['status','track','order status','progress','pipeline','stage'],
    answer: 'Track your hire from your **Dashboard**. The stages are:\n**Contact Initiated → Interview Scheduled → Government Paperwork → Employment Commenced → Completed**.\nThe agency advances the status and you\'re notified at each step.',
  },
  {
    keys: ['portfolio','photo','gallery','image','upload'],
    answer: 'Agencies upload portfolio images when editing a talent profile. Go to **/agency/dashboard** → Edit talent → scroll to **Portfolio Gallery** → click "Add Images". Supports JPG, PNG, WebP.',
  },
  {
    keys: ['premium','star','featured','gold','badge'],
    answer: '⭐ **Premium agencies** appear first in search results and have a gold badge. Premium status is granted by the admin. Contact **hello@linesbyams.qa** to inquire.',
  },
  {
    keys: ['arabic','language','rtl','عربي'],
    answer: 'Lines By AMS supports **Arabic**! Click the **"ع"** button in the top navbar to switch to Arabic (right-to-left layout). Talent profiles also support Arabic name and bio fields.',
  },
  {
    keys: ['cancel','refund','reject','withdraw'],
    answer: 'You can request to cancel a hire before the agency accepts. After acceptance, message the agency through the platform. For disputes, email **hello@linesbyams.qa**.',
  },
  {
    keys: ['approve','approval','pending','waiting'],
    answer: 'After registering as an agency, admin reviews your profile within **1-2 business days**. Once approved, you can log in and start listing talent on your agency dashboard.',
  },
  {
    keys: ['contact','support','help','email','whatsapp','instagram'],
    answer: 'Reach us at:\n📧 **hello@linesbyams.qa**\n📱 WhatsApp: **+974 1234 5678**\n📸 Instagram: **@linesbyams**\n\nWe typically respond within 24 hours.',
  },
  {
    keys: ['boutique','boutique owner','retail','buyer','merchandiser','visual'],
    answer: 'Lines By AMS features **Boutique** professionals including **Boutique Owners**, **Retail Buyers**, and **Visual Merchandisers**. Browse them at /browse and filter by skill.',
  },
  {
    keys: ['model','stylist','photographer','makeup','designer','talent categories','skills'],
    answer: 'We feature **18 talent categories**: Model, Stylist, Photographer, Videographer, Makeup Artist, Hair Stylist, Fashion Designer, Seamstress/Tailor, Textile Artist, Wardrobe Manager, Brand Ambassador, Social Media Influencer, Art Director, Fashion Illustrator, Pattern Maker, Boutique Owner, Retail Buyer, Visual Merchandiser.',
  },
  {
    keys: ['contract','yearly','monthly','hourly','type'],
    answer: 'Lines By AMS supports three contract types: **Yearly**, **Monthly**, and **Hourly**. Choose your preferred type when submitting a hire request.',
  },
  {
    keys: ['qatar','gcc','location','country','region'],
    answer: 'Lines By AMS is based in **Qatar 🇶🇦** and serves clients across the **GCC region**. All pricing is displayed in **QAR (Qatari Riyal)**.',
  },
];

function matchFAQ(message) {
  const lower = message.toLowerCase();
  for (const item of FAQ) {
    if (item.keys.some(k => lower.includes(k))) return item.answer;
  }
  return null;
}

// ── Markdown renderer: **bold** + line breaks ─────────────────────────────────
function renderMarkdown(text) {
  const parts = [];
  let i = 0;
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  for (const seg of segments) {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      parts.push(<strong key={i++}>{seg.slice(2, -2)}</strong>);
    } else {
      seg.split('\n').forEach((line, j) => {
        if (j > 0) parts.push(<br key={`br-${i++}`} />);
        parts.push(<span key={i++}>{line}</span>);
      });
    }
  }
  return parts;
}

// ── Main ChatWidget component ─────────────────────────────────────────────────
export default function ChatWidget() {
  const [open,       setOpen]       = useState(false);
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!hasGreeted) {
        setMessages([{
          role: 'assistant',
          content: "Hi! 👋 I'm your **Lines By AMS** assistant. I can help you with hiring talent, understanding how the platform works, payments, and more. What can I help you with today?",
        }]);
        setHasGreeted(true);
      }
    }
  }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    // 1️⃣ Try client-side FAQ first (instant, no backend needed)
    const faqAnswer = matchFAQ(msg);
    if (faqAnswer) {
      // Small delay so the typing indicator shows briefly
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: faqAnswer }]);
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 600);
      return;
    }

    // 2️⃣ Fall back to AI backend if FAQ didn't match
    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/chat', { message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      // Generic fallback if backend is also unavailable
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm not sure about that specific question. For detailed help, please email **hello@linesbyams.qa** or WhatsApp **+974 1234 5678** — we respond within 24 hours! 😊",
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* ── Floating action button ── */}
      <button
        className={`chat-fab ${open ? 'chat-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
        title="Chat with us"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6"  x2="6"  y2="18" />
            <line x1="6"  y1="6"  x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
        {!open && <span className="chat-fab__pulse" />}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div className="chat-window" role="dialog" aria-label="Chat assistant">
          <div className="chat-header">
            <div className="chat-header__avatar"><span>✨</span></div>
            <div className="chat-header__info">
              <strong>Lines By AMS Assistant</strong>
              <span>Always here to help</span>
            </div>
            <button className="chat-header__close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
                {m.role === 'assistant' && <div className="chat-bubble__avatar">✨</div>}
                <div className="chat-bubble__text">{renderMarkdown(m.content)}</div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble chat-bubble--assistant">
                <div className="chat-bubble__avatar">✨</div>
                <div className="chat-bubble__text chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {showSuggestions && !loading && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s.msg} className="chat-chip" onClick={() => send(s.msg)}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="chat-input-bar">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your question…"
              disabled={loading}
              className="chat-input"
              maxLength={500}
            />
            <button
              className="chat-send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
