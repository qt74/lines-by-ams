import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Messages() {
  const { user }      = useAuth();
  const { t }         = useTranslation();
  const { empId }     = useParams();   // optional: open a specific thread
  const navigate      = useNavigate();
  const bottomRef     = useRef(null);

  const [threads,        setThreads]        = useState([]);
  const [activeThread,   setActiveThread]   = useState(null); // { employment, latestMessage, unreadCount }
  const [messages,       setMessages]       = useState([]);
  const [draft,          setDraft]          = useState('');
  const [loadingInbox,   setLoadingInbox]   = useState(true);
  const [loadingThread,  setLoadingThread]  = useState(false);
  const [sending,        setSending]        = useState(false);

  // Load inbox
  useEffect(() => {
    api.get('/messages')
      .then(r => {
        setThreads(r.data.threads || []);
        // If URL has empId, auto-open that thread
        if (empId) {
          const found = r.data.threads?.find(th => th.employment._id === empId);
          if (found) setActiveThread(found);
        }
      })
      .catch(() => toast.error('Could not load messages'))
      .finally(() => setLoadingInbox(false));
  }, []);

  // Load thread messages when activeThread changes
  const loadThread = useCallback(async (thread) => {
    setActiveThread(thread);
    setLoadingThread(true);
    try {
      const res = await api.get(`/messages/${thread.employment._id}`);
      setMessages(res.data.messages || []);
      // Mark as read — update unreadCount locally
      setThreads(prev => prev.map(th =>
        th.employment._id === thread.employment._id
          ? { ...th, unreadCount: 0 }
          : th
      ));
    } catch {
      toast.error('Could not load conversation');
    }
    setLoadingThread(false);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!draft.trim() || !activeThread) return;
    setSending(true);
    try {
      const res = await api.post('/messages', {
        employmentId: activeThread.employment._id,
        content:      draft.trim(),
      });
      setMessages(prev => [...prev, res.data.message]);
      setDraft('');
      // Update inbox preview
      setThreads(prev => prev.map(th =>
        th.employment._id === activeThread.employment._id
          ? { ...th, latestMessage: res.data.message }
          : th
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Send failed');
    }
    setSending(false);
  };

  const getOtherName = (thread) => {
    if (user.role === 'customer') return thread.employment.agency?.agencyName || 'Agency';
    return thread.employment.customer?.name || 'Customer';
  };

  const getOtherInitial = (thread) => getOtherName(thread).charAt(0).toUpperCase();

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diffH = (now - d) / 36e5;
    if (diffH < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <main className="messages-page">
      <div className="container">
        <h1 style={{ marginBottom: '1.5rem' }}>Messages</h1>

        {loadingInbox ? (
          <div className="loading-screen">{t('common.loading')}</div>
        ) : threads.length === 0 ? (
          <div className="inbox-empty">
            <span style={{ fontSize: '3rem' }}>💬</span>
            <p>No conversations yet.</p>
            <p style={{ fontSize: '.9rem' }}>
              {user.role === 'customer'
                ? 'Browse talent and send a hire request to start a conversation.'
                : 'Conversations will appear here once customers send hire requests.'}
            </p>
            {user.role === 'customer' && (
              <button className="btn btn--solid" onClick={() => navigate('/browse')}>
                Browse Talent
              </button>
            )}
          </div>
        ) : (
          <div className="messages-layout">
            {/* ── INBOX LIST ──────────────────────────────── */}
            <div className="inbox-list">
              <div className="inbox-list__header">Conversations</div>
              {threads.map(thread => (
                <div
                  key={thread.employment._id}
                  className={`inbox-item ${activeThread?.employment._id === thread.employment._id ? 'inbox-item--active' : ''}`}
                  onClick={() => loadThread(thread)}
                >
                  <div className="inbox-item__avatar">{getOtherInitial(thread)}</div>
                  <div className="inbox-item__info">
                    <div className="inbox-item__name">{getOtherName(thread)}</div>
                    <div className="inbox-item__preview">
                      {thread.latestMessage?.content || `Re: ${thread.employment.talent?.name || 'Hiring'}`}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'.3rem' }}>
                    <div className="inbox-item__time">{formatTime(thread.latestMessage?.createdAt)}</div>
                    {thread.unreadCount > 0 && (
                      <div className="inbox-item__unread" title={`${thread.unreadCount} unread`} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── THREAD PANE ─────────────────────────────── */}
            <div className="thread-pane">
              {!activeThread ? (
                <div className="inbox-empty">
                  <span style={{ fontSize: '2.5rem' }}>👈</span>
                  <p>Select a conversation</p>
                </div>
              ) : (
                <>
                  <div className="thread-pane__header">
                    {getOtherName(activeThread)}
                    <span style={{ fontWeight: 400, fontSize: '.85rem', color: 'var(--gray-500)', marginLeft: '.5rem' }}>
                      · Re: {activeThread.employment.talent?.name || 'Hiring request'}
                    </span>
                  </div>

                  <div className="thread-messages">
                    {loadingThread ? (
                      <p style={{ color: 'var(--gray-400)', textAlign: 'center' }}>Loading…</p>
                    ) : messages.length === 0 ? (
                      <p style={{ color: 'var(--gray-400)', textAlign: 'center' }}>No messages yet. Say hello!</p>
                    ) : (
                      messages.map(msg => {
                        const mine = msg.sender?._id === user._id || msg.sender === user._id;
                        return (
                          <div key={msg._id} className={`msg-bubble ${mine ? 'msg-bubble--mine' : 'msg-bubble--theirs'}`}>
                            {msg.content}
                            <div className="msg-bubble__time">{formatTime(msg.createdAt)}</div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <form className="thread-compose" onSubmit={handleSend}>
                    <textarea
                      rows={2}
                      placeholder="Type a message…"
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                      }}
                    />
                    <button className="btn btn--solid" disabled={sending || !draft.trim()}>
                      {sending ? '…' : 'Send'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
