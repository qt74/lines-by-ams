import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CONTRACTS = ['Yearly','Monthly','Hourly'];

export default function TalentDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [talent,  setTalent]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiring,  setHiring]  = useState(false);
  const [form,    setForm]    = useState({ contractType: 'Yearly', notes: '' });
  const [showForm,setShowForm]= useState(false);

  useEffect(() => {
    api.get(`/talent/${id}`)
      .then(r => setTalent(r.data.talent))
      .catch(() => toast.error('Talent not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleHire = async e => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'customer') return toast.error('Only employers can send hire requests');
    setHiring(true);
    try {
      await api.post('/employment', { talentId: id, ...form });
      toast.success('Hire request sent!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
    setHiring(false);
  };

  if (loading) return <div className="loading-screen">{t('common.loading')}</div>;
  if (!talent) return <div className="container" style={{padding:'4rem 0'}}><p>Talent not found.</p></div>;

  const name = (i18n.language === 'ar' && talent.nameAr) ? talent.nameAr : talent.name;
  const bio  = (i18n.language === 'ar' && talent.bioAr)  ? talent.bioAr  : talent.bio;

  return (
    <main className="talent-detail">
      <div className="container">
        <div className="talent-detail__layout">
          {/* LEFT — Photo + quick info */}
          <aside className="talent-detail__sidebar">
            <img
              src={talent.photo || 'https://images.unsplash.com/photo-1618407960998-7864dd928574?auto=format&fit=crop&w=600&q=80'}
              alt={name}
              className="talent-detail__photo"
            />
            <div className="talent-detail__agency">
              <p>{t('talent.agency')}</p>
              <strong>{talent.agency?.agencyName}</strong>
            </div>
            <div className="talent-detail__meta">
              <div className="meta-item"><span>📍</span>{talent.location || '—'}</div>
              <div className="meta-item"><span>⏱</span>{talent.experience} years exp.</div>
              <div className="meta-item">
                <span>💰</span>
                {talent.salaryRange?.min?.toLocaleString()} – {talent.salaryRange?.max?.toLocaleString()} QAR
              </div>
              <div className="meta-item">
                <span className={`avail-dot ${talent.availability.toLowerCase()}`} />
                {t(`talent.${talent.availability.toLowerCase()}`)}
              </div>
            </div>

            {/* HIRE BUTTON */}
            {user?.role === 'customer' && talent.availability === 'Available' && (
              <button className="btn btn--solid btn--full" onClick={() => setShowForm(v => !v)}>
                {t('talent.contactAgency')}
              </button>
            )}
            {!user && (
              <button className="btn btn--solid btn--full" onClick={() => navigate('/login')}>
                Sign in to hire
              </button>
            )}
          </aside>

          {/* RIGHT — Details */}
          <div className="talent-detail__main">
            <h1 className="talent-detail__name">{name}</h1>

            <div className="talent-detail__skills">
              {talent.skills?.map(s => <span key={s} className="skill-tag skill-tag--lg">{s}</span>)}
            </div>

            <div className="talent-detail__contracts">
              {talent.contractTypes?.map(c => <span key={c} className="contract-tag">{c}</span>)}
            </div>

            {bio && (
              <section className="talent-detail__section">
                <h2>{t('talent.aboutTalent')}</h2>
                <p>{bio}</p>
              </section>
            )}

            {talent.portfolio?.length > 0 && (
              <section className="talent-detail__section">
                <h2>{t('talent.portfolio')}</h2>
                <div className="portfolio-grid">
                  {talent.portfolio.map((img, i) => <img key={i} src={img} alt={`Portfolio ${i+1}`} />)}
                </div>
              </section>
            )}

            {/* HIRE FORM */}
            {showForm && (
              <section className="talent-detail__section hire-form">
                <h2>Send Hire Request</h2>
                <form onSubmit={handleHire}>
                  <label>Contract Type
                    <select value={form.contractType} onChange={e => setForm(f => ({...f, contractType: e.target.value}))}>
                      {talent.contractTypes?.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <label>Notes (optional)
                    <textarea rows={3} value={form.notes}
                      onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                      placeholder="Any specific requirements or questions..." />
                  </label>
                  <button className="btn btn--solid" disabled={hiring}>
                    {hiring ? 'Sending...' : 'Send Hire Request'}
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
