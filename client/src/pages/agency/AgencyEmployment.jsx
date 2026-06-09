import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AGENCY_STATUSES = [
  'Interview Scheduled',
  'Government Paperwork Initiated',
  'Government Paperwork In Progress',
  'Government Paperwork Finalized',
  'Employment Commenced',
  'Completed',
  'Cancelled',
];

export default function AgencyEmployment() {
  const { id } = useParams();
  const { t }  = useTranslation();

  const [employment, setEmployment] = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [msgText,    setMsgText]    = useState('');
  const [loading,    setLoading]    = useState(true);
  const [salary,     setSalary]     = useState('');
  const [updating,   setUpdating]   = useState(false);
  const msgEnd = useRef(null);

  const load = () =>
    Promise.all([
      api.get(`/employment/${id}`),
      api.get(`/messages/${id}`),
    ]).then(([eRes, mRes]) => {
      setEmployment(eRes.data.employment);
      setMessages(mRes.data.messages);
      if (eRes.data.employment.agreedSalary) setSalary(eRes.data.employment.agreedSalary);
    });

  useEffect(() => { load().finally(() => setLoading(false)); }, [id]);
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const payload = { status };
      if (salary) payload.agreedSalary = Number(salary);
      const res = await api.patch(`/employment/${id}/status`, payload);
      setEmployment(res.data.employment);
      toast.success(`Status updated: ${t(`employment.statuses.${res.data.employment.status}`)}`);
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
  if (!employment) return <div className="container" style={{padding:'4rem 0'}}><p>Not found.</p></div>;

  const e = employment;

  return (
    <main className="employment-detail">
      <div className="container">
        <div className="employment-detail__header">
          <div className="employment-detail__talent">
            <img src={e.talent?.photo || 'https://images.unsplash.com/photo-1618407960998-7864dd928574?auto=format&fit=crop&w=80&q=80'} alt="" />
            <div>
              <h1>{e.talent?.name}</h1>
              <p>Requested by <strong>{e.customer?.name}</strong> · <span className="badge">{e.contractType}</span></p>
            </div>
          </div>
          <span className={`status-badge status-badge--lg status--${e.status.toLowerCase().replace(/\s+/g,'-')}`}>
            {t(`employment.statuses.${e.status}`)}
          </span>
        </div>

        <div className="employment-detail__layout">
          <div className="employment-detail__main">
            {/* SET AGREED SALARY */}
            <section className="detail-section">
              <h2>Agreed Salary (QAR)</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input type="number" className="salary-input" value={salary}
                  onChange={e => setSalary(e.target.value)}
                  placeholder="e.g. 10000" />
                <span className="form-hint">Platform takes 10% ({salary ? Math.round(salary * 0.1).toLocaleString() : '—'} QAR)</span>
              </div>
            </section>

            {/* ADVANCE STATUS */}
            <section className="detail-section">
              <h2>Update Status</h2>
              <p className="form-hint">Current: <strong>{t(`employment.statuses.${e.status}`)}</strong></p>
              <div className="status-buttons">
                {AGENCY_STATUSES.map(s => (
                  <button key={s}
                    className={`btn btn--outline btn--sm ${e.status === s ? 'active' : ''}`}
                    disabled={updating || e.status === s || e.status === 'Completed' || e.status === 'Cancelled'}
                    onClick={() => updateStatus(s)}
                  >
                    {t(`employment.statuses.${s}`)}
                  </button>
                ))}
              </div>
            </section>

            {/* STATUS HISTORY */}
            <section className="detail-section">
              <h2>History</h2>
              <ol className="history-list">
                {e.statusHistory?.map((h, i) => (
                  <li key={i}>
                    <strong>{t(`employment.statuses.${h.status}`)}</strong>
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
              {messages.map(m => (
                <div key={m._id} className={`chat-msg ${m.sender?.role === 'agency' ? 'chat-msg--self' : ''}`}>
                  <div className="chat-msg__bubble">{m.content}</div>
                  <span className="chat-msg__time">{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                </div>
              ))}
              <div ref={msgEnd} />
            </div>
            <form className="chat-input" onSubmit={sendMsg}>
              <input value={msgText} onChange={e => setMsgText(e.target.value)}
                placeholder={t('employment.sendMessage')} />
              <button className="btn btn--solid btn--sm">Send</button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}
