import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Statuses the agency can set after accepting
const PROGRESS_STATUSES = [
  'Interview Scheduled',
  'Government Paperwork Initiated',
  'Government Paperwork In Progress',
  'Government Paperwork Finalized',
  'Employment Commenced',
  'Completed',
];

export default function AgencyEmployment() {
  const { id }    = useParams();
  const { t }     = useTranslation();
  const navigate  = useNavigate();

  const [employment, setEmployment] = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [msgText,    setMsgText]    = useState('');
  const [loading,    setLoading]    = useState(true);
  const [salary,     setSalary]     = useState('');
  const [note,       setNote]       = useState('');
  const [updating,   setUpdating]   = useState(false);
  const msgEnd = useRef(null);

  const load = () =>
    Promise.all([
      api.get(`/employment/${id}`),
      api.get(`/messages/${id}`),
    ]).then(([eRes, mRes]) => {
      setEmployment(eRes.data.employment);
      setMessages(mRes.data.messages || []);
      if (eRes.data.employment.agreedSalary) setSalary(eRes.data.employment.agreedSalary);
    });

  useEffect(() => { load().finally(() => setLoading(false)); }, [id]);
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const payload = { status, note };
      if (salary) payload.agreedSalary = Number(salary);
      const res = await api.patch(`/employment/${id}/status`, payload);
      setEmployment(res.data.employment);
      setNote('');
      toast.success(`Status: ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setUpdating(false);
  };

  const sendMsg = async e => {
    e.preventDefault();
    if (!msgText.trim()) return;
    try {
      const res = await api.post('/messages', { employmentId: id, content: msgText });
      setMessages(m => [...m, res.data.message]);
      setMsgText('');
    } catch { toast.error('Failed to send'); }
  };

  if (loading) return <div className="loading-screen">{t('common.loading')}</div>;
  if (!employment) return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <p>Employment not found.</p>
      <button className="btn btn--outline" onClick={() => navigate(-1)}>← Back</button>
    </div>
  );

  const e = employment;
  const isPending   = e.status === 'Contact Initiated';
  const isCancelled = e.status === 'Cancelled';
  const isCompleted = e.status === 'Completed';
  const isFinished  = isCancelled || isCompleted;

  return (
    <main className="employment-detail">
      <div className="container">

        {/* HEADER */}
        <div className="employment-detail__header">
          <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
            ← Back
          </button>
          <div className="employment-detail__talent">
            <img
              src={e.talent?.photo || 'https://images.unsplash.com/photo-1618407960998-7864dd928574?auto=format&fit=crop&w=80&q=80'}
              alt=""
            />
            <div>
              <h1>{e.talent?.name}</h1>
              <p>
                Request from <strong>{e.customer?.name}</strong>
                {e.customer?.email && <> · <a href={`mailto:${e.customer.email}`}>{e.customer.email}</a></>}
                &nbsp;· <span className="badge">{e.contractType}</span>
              </p>
              {e.notes && <p className="form-hint" style={{ marginTop: '.4rem' }}>Note: "{e.notes}"</p>}
            </div>
          </div>
          <span className={`status-badge status-badge--lg status--${e.status.toLowerCase().replace(/\s+/g,'-')}`}>
            {e.status}
          </span>
        </div>

        {/* ── NEW REQUEST: ACCEPT / REJECT ────────────────── */}
        {isPending && (
          <div className="action-banner action-banner--pending">
            <div>
              <strong>New hire request!</strong>
              <p>Accept to proceed with the process, or reject to decline.</p>
            </div>
            <div className="action-banner__btns">
              <button
                className="btn btn--solid"
                disabled={updating}
                onClick={() => updateStatus('Interview Scheduled')}
              >
                ✅ Accept &amp; Schedule Interview
              </button>
              <button
                className="btn btn--danger"
                disabled={updating}
                onClick={() => updateStatus('Cancelled')}
              >
                ✕ Reject Request
              </button>
            </div>
          </div>
        )}

        <div className="employment-detail__layout">
          <div className="employment-detail__main">

            {/* AGREED SALARY */}
            {!isFinished && (
              <section className="detail-section">
                <h2>Agreed Salary (QAR)</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    className="salary-input"
                    value={salary}
                    onChange={ev => setSalary(ev.target.value)}
                    placeholder="e.g. 10000"
                  />
                  {salary > 0 && (
                    <span className="form-hint">
                      Platform fee: {Math.round(salary * 0.1).toLocaleString()} QAR (10%) ·
                      Your payout: {Math.round(salary * 0.9).toLocaleString()} QAR
                    </span>
                  )}
                </div>
              </section>
            )}

            {/* ADVANCE STATUS */}
            {!isPending && !isFinished && (
              <section className="detail-section">
                <h2>Advance Status</h2>
                <p className="form-hint" style={{ marginBottom: '1rem' }}>
                  Current: <strong>{e.status}</strong>
                </p>

                <label className="form-hint" style={{ marginBottom: '.5rem', display: 'block' }}>
                  Add a note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={ev => setNote(ev.target.value)}
                  placeholder="e.g. Interview confirmed for Monday"
                  style={{ width: '100%', marginBottom: '1rem' }}
                />

                <div className="status-buttons">
                  {PROGRESS_STATUSES.map(s => (
                    <button
                      key={s}
                      className={`btn btn--sm ${e.status === s ? 'btn--solid' : 'btn--outline'}`}
                      disabled={updating || e.status === s}
                      onClick={() => updateStatus(s)}
                    >
                      {e.status === s ? '✓ ' : ''}{s}
                    </button>
                  ))}
                  <button
                    className="btn btn--danger btn--sm"
                    disabled={updating}
                    onClick={() => {
                      if (window.confirm('Cancel this employment? This cannot be undone.'))
                        updateStatus('Cancelled');
                    }}
                  >
                    Cancel Employment
                  </button>
                </div>
              </section>
            )}

            {/* FINAL STATE */}
            {isFinished && (
              <div className={`action-banner ${isCompleted ? 'action-banner--success' : 'action-banner--cancelled'}`}>
                <strong>{isCompleted ? '✅ Employment Completed' : '✕ Employment Cancelled'}</strong>
                <p>{isCompleted
                  ? 'This engagement has been marked as completed.'
                  : 'This request was declined or cancelled.'}</p>
              </div>
            )}

            {/* STATUS HISTORY */}
            <section className="detail-section">
              <h2>Timeline</h2>
              <ol className="history-list">
                {e.statusHistory?.map((h, i) => (
                  <li key={i}>
                    <strong>{h.status}</strong>
                    {h.note && <span> — {h.note}</span>}
                    <span className="history-time">{new Date(h.timestamp).toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* MESSAGES */}
          <aside className="employment-detail__chat">
            <h2>Messages with {e.customer?.name}</h2>
            <div className="chat-messages">
              {messages.length === 0
                ? <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '1rem' }}>No messages yet</p>
                : messages.map(m => (
                  <div key={m._id} className={`chat-msg ${m.sender?.role === 'agency' ? 'chat-msg--self' : ''}`}>
                    <div className="chat-msg__bubble">{m.content}</div>
                    <span className="chat-msg__time">{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                ))
              }
              <div ref={msgEnd} />
            </div>
            <form className="chat-input" onSubmit={sendMsg}>
              <input
                value={msgText}
                onChange={ev => setMsgText(ev.target.value)}
                placeholder="Type a message…"
                disabled={isFinished}
              />
              <button className="btn btn--solid btn--sm" disabled={isFinished}>Send</button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}
