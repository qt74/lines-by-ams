import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const [employments, setEmployments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    api.get('/employment/my')
      .then(r => setEmployments(r.data.employments))
      .catch(() => toast.error('Failed to load hirings'))
      .finally(() => setLoading(false));
  }, []);

  const active    = employments.filter(e => !['Completed','Cancelled'].includes(e.status));
  const completed = employments.filter(e =>  ['Completed','Cancelled'].includes(e.status));

  return (
    <main className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>{t('employment.title')}</h1>
            <p>{active.length} active · {completed.length} completed</p>
          </div>
          <Link to="/browse" className="btn btn--solid">Browse Talent</Link>
        </div>

        {loading ? <p>{t('common.loading')}</p> : employments.length === 0 ? (
          <div className="empty-state">
            <p>You haven't hired any talent yet.</p>
            <Link to="/browse" className="btn btn--solid">Start Browsing</Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="dashboard-section">
                <h2>Active Hirings</h2>
                <div className="employment-cards">
                  {active.map(e => <EmploymentCard key={e._id} employment={e} />)}
                </div>
              </section>
            )}
            {completed.length > 0 && (
              <section className="dashboard-section">
                <h2>Past Hirings</h2>
                <div className="employment-cards">
                  {completed.map(e => <EmploymentCard key={e._id} employment={e} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function EmploymentCard({ employment: e }) {
  const { t } = useTranslation();
  const STEP_ORDER = [
    'Contact Initiated','Interview Scheduled','Down-payment Received',
    'Government Paperwork Initiated','Government Paperwork In Progress',
    'Government Paperwork Finalized','Ready for Full Payment',
    'Full Payment Received','Employment Commenced','Completed',
  ];
  const currentIdx = STEP_ORDER.indexOf(e.status);
  const pct = Math.round(((currentIdx + 1) / STEP_ORDER.length) * 100);

  return (
    <div className="employment-card">
      <div className="employment-card__left">
        <img src={e.talent?.photo || 'https://images.unsplash.com/photo-1618407960998-7864dd928574?auto=format&fit=crop&w=80&q=80'} alt={e.talent?.name} />
        <div>
          <strong>{e.talent?.name}</strong>
          <span>{e.agency?.agencyName}</span>
          <span className="badge">{e.contractType}</span>
        </div>
      </div>
      <div className="employment-card__progress">
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
        </div>
        <span className={`status-badge status--${e.status.toLowerCase().replace(/\s+/g,'-')}`}>
          {t(`employment.statuses.${e.status}`)}
        </span>
      </div>
      <Link to={`/employment/${e._id}`} className="btn btn--outline btn--sm">View →</Link>
    </div>
  );
}
