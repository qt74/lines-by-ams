import { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';

// ── Quick-reply suggestion chips shown before any conversation ──────────────
const SUGGESTIONS = [
  { label: '👋 What is this platform?',   msg: 'What is Lines By AMS?' },
  { label: '🛍️ How to hire talent?',       msg: 'How do I hire talent?' },
  { label: '💰 Pricing & fees',            msg: 'What are the fees and pricing?' },
  { label: '🏢 Register as agency',        msg: 'How do I register as an agency?' },
  { label: '📦 Track my order',            msg: 'How do I track my hire request status?' },
  { label: '💬 Messaging',                 msg: 'How does messaging work?' },
  { label: '📞 Contact support',           msg: 'How can I contact support?' },
];

// Simple markdown-ish renderer: bold and line breaks
function renderMarkdown(text) {
  const parts = [];
  let i = 0;
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  for (const seg of segments) {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      parts.push(<strong key={i++}>{seg.slice(2, -2)}</strong>);
    } else {
      // Handle line breaks
      const lines = seg.split('\n');
      lines.forEach((line, j) => {
        if (j > 0) parts.push(<br key={`br-${i++}`} />);
        parts.push(<span key={i++}>{line}</span>);
      });
    }
  }
  return parts;
}

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when widget opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!hasGreeted) {
        setMessages([{
          role: 'assistant',
          content: "Hi! 👋 I'm your Lines By AMS assistant. I can help you with hiring talent, understanding how the platform works, payments, and more. What can I help you with today?",
        }]);
        setHasGreeted(true);
      }
    }
  }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    // Keep last 8 messages for context (only send user/assistant turns)
    const history = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't connect. Please try again or email **hello@linesbyams.qa**.",
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const showSuggestions = messages.length <= 1; // only show after greeting

  return (
    <>
      {/* ── Floating button ─────────────────────────────────── */}
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

      {/* ── Chat window ─────────────────────────────────────── */}
      {open && (
        <div className="chat-window" role="dialog" aria-label="Chat assistant">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header__avatar">
              <span>✨</span>
            </div>
            <div className="chat-header__info">
              <strong>Lines By AMS Assistant</strong>
              <span>Always here to help</span>
            </div>
            <button className="chat-header__close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="chat-bubble__avatar">✨</div>
                )}
                <div className="chat-bubble__text">
                  {renderMarkdown(m.content)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chat-bubble chat-bubble--assistant">
                <div className="chat-bubble__avatar">✨</div>
                <div className="chat-bubble__text chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {/* Quick-reply chips */}
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

          {/* Input bar */}
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
