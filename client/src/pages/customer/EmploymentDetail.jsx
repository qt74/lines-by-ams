import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || '');

const STEPS = [
  'Contact Initiated','Interview Scheduled','Down-payment Received',
  'Government Paperwork Initiated','Government Paperwork In Progress',
  'Government Paperwork Finalized','Ready for Full Payment',
  'Full Payment Received','Employment Commenced','Completed',
];

export default function EmploymentDetail() {
  const { id } = useParams();
  const { t }  = useTranslation();

  const [employment, setEmployment] = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [msgText,    setMsgText]    = useState('');
  const [loading,    setLoading]    = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const msgEnd = useRef(null);

  const load = () =>
    Promise.all([
      api.get(`/employment/${id}`),
      api.get(`/messages/${id}`),
    ]).then(([eRes, mRes]) => {
      setEmployment(eRes.data.employment);
      setMessages(mRes.data.messages);
    }).catch(() => toast.error('Failed to load'));

  useEffect(() => { load().finally(() => setLoading(false)); }, [id]);
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const confirmDown = async () => {
    try {
      const res = await api.patch(`/employment/${id}/downpayment`);
      setEmployment(res.data.employment);
      toast.success('Down-payment confirmed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const initPayment = async () => {
    try {
      const res = await api.post(`/employment/${id}/payment`);
      setClientSecret(res.data.clientSecret);
    } catch (err) { toast.error(err.response?.data?.message || 'Payment setup failed'); }
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

  const e  = employment;
  const ci = STEPS.indexOf(e.status);

  return (
    <main className="employment-detail">
      <div className="container">
        <div className="employment-detail__header">
          <div className="employment-detail__talent">
            <img src={e.talent?.photo || 'https://images.unsplash.com/photo-1618407960998-7864dd928574?auto=format&fit=crop&w=80&q=80'} alt="" />
            <div>
              <h1>{e.talent?.name}</h1>
              <p>{e.agency?.agencyName} · <span className="badge">{e.contractType}</span></p>
            </div>
          </div>
          <span className={`status-badge status-badge--lg status--${e.status.toLowerCase().replace(/\s+/g,'-')}`}>
            {t(`employment.statuses.${e.status}`)}
          </span>
        </div>

        <div className="employment-detail__layout">
          {/* TIMELINE */}
          <div className="employment-detail__main">
            <section className="detail-section">
              <h2>{t('employment.timeline')}</h2>
              <ol className="timeline">
                {STEPS.map((step, idx) => (
                  <li key={step} className={`timeline__step ${idx < ci ? 'done' : idx === ci ? 'active' : 'pending'}`}>
                    <div className="timeline__dot" />
                    <div className="timeline__label">
                      <strong>{t(`employment.statuses.${step}`)}</strong>
                      {e.statusHistory?.find(h => h.status === step)?.timestamp && (
                        <span>{new Date(e.statusHistory.find(h => h.status === step).timestamp).toLocaleDateString()}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* DOWN-PAYMENT */}
            {e.status === 'Interview Scheduled' && !e.downPaymentConfirmed && (
              <section className="detail-section action-section">
                <h2>Confirm Down-Payment</h2>
                <p className="action-note">{t('employment.confirmDownNote')}</p>
                <button className="btn btn--solid" onClick={confirmDown}>
                  {t('employment.confirmDown')}
                </button>
              </section>
            )}

            {/* FULL PAYMENT */}
            {e.status === 'Ready for Full Payment' && !clientSecret && (
              <section className="detail-section action-section">
                <h2>Complete Full Payment</h2>
                <p>Agreed amount: <strong>{e.agreedSalary?.toLocaleString()} QAR</strong></p>
                <p className="action-note">Platform fee (10%): {e.platformFee?.toLocaleString()} QAR</p>
                <button className="btn btn--solid" onClick={initPayment}>
                  {t('employment.payNow', { amount: e.agreedSalary?.toLocaleString() })}
                </button>
              </section>
            )}

            {clientSecret && (
              <section className="detail-section action-section">
                <h2>Enter Payment Details</h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm employmentId={id} onSuccess={() => { setClientSecret(''); load(); }} />
                </Elements>
              </section>
            )}
          </div>

          {/* MESSAGES */}
          <aside className="employment-detail__chat">
            <h2>Messages</h2>
            <div className="chat-messages">
              {messages.map(m => (
                <div key={m._id} className={`chat-msg ${m.sender?.role === 'customer' ? 'chat-msg--self' : ''}`}>
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

function PaymentForm({ employmentId, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async e => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    if (error) { toast.error(error.message); }
    else       { toast.success('Payment successful!'); onSuccess(); }
    setPaying(false);
  };

  return (
    <form onSubmit={handlePay}>
      <PaymentElement />
      <button className="btn btn--solid btn--full" style={{marginTop:'1rem'}} disabled={!stripe || paying}>
        {paying ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
