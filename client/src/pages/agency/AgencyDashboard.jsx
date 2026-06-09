import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AgencyDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const agency = user?.agency;

  const [talent,      setTalent]      = useState([]);
  const [employments, setEmployments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/talent/my'),
      api.get('/employment/agency'),
    ]).then(([tRes, eRes]) => {
      setTalent(tRes.data.talent);
      setEmployments(eRes.data.employments);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (!agency?.isApproved) {
    return (
      <main className="dashboard-page">
        <div className="container">
          <div className="pending-notice">
            <span className="pending-notice__icon">⏳</span>
            <h2>Pending Approval</h2>
            <p>Your agency <strong>{agency?.agencyName}</strong> is under review. You'll be notified once approved by our admin team.</p>
          </div>
        </div>
      </main>
    );
  }

  const stats = [
    { label: 'Talent Listed',       value: talent.length },
    { label: 'Active Requests',     value: employments.filter(e => !['Completed','Cancelled'].includes(e.status)).length },
    { label: t('agency.totalPlacements'), value: agency?.totalPlacements || 0 },
    { label: t('agency.totalEarned'),     value: `${(agency?.totalEarned || 0).toLocaleString()} QAR` },
  ];

  return (
    <main className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>{t('agency.dashboard')}</h1>
            <p>Welcome back, <strong>{agency?.agencyName}</strong></p>
          </div>
          <Link to="/agency/talent/new" className="btn btn--solid">{t('agency.addTalent')} +</Link>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__value">{loading ? '—' : s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* HIRE REQUESTS */}
        <section className="dashboard-section">
          <h2>{t('agency.requests')}</h2>
          {loading ? <p>{t('common.loading')}</p> : employments.length === 0 ? (
            <p className="empty-text">No hire requests yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Talent</th>
                    <th>Customer</th>
                    <th>Contract</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employments.map(e => (
                    <tr key={e._id}>
                      <td>
                        <div className="table-talent">
                          <img src={e.talent?.photo || 'https://images.unsplash.com/photo-1618407960998-7864dd928574?auto=format&fit=crop&w=80&q=80'} alt="" />
                          <span>{e.talent?.name}</span>
                        </div>
                      </td>
                      <td>{e.customer?.name}</td>
                      <td><span className="badge">{e.contractType}</span></td>
                      <td><span className={`status-badge status--${e.status.toLowerCase().replace(/\s+/g,'-')}`}>{t(`employment.statuses.${e.status}`)}</span></td>
                      <td><Link to={`/agency/employment/${e._id}`} className="btn btn--outline btn--sm">Manage</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* MY TALENT */}
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>{t('agency.myTalent')}</h2>
            <Link to="/agency/talent/new" className="btn btn--outline btn--sm">+ Add</Link>
          </div>
          {loading ? <p>{t('common.loading')}</p> : talent.length === 0 ? (
            <div className="empty-state">
              <p>No talent listed yet.</p>
              <Link to="/agency/talent/new" className="btn btn--solid">Add your first talent profile</Link>
            </div>
          ) : (
            <div className="talent-table-grid">
              {talent.map(t => (
                <div key={t._id} className="talent-row">
                  <img src={t.photo || 'https://images.unsplash.com/photo-1618407960998-7864dd928574?auto=format&fit=crop&w=80&q=80'} alt={t.name} />
                  <div className="talent-row__info">
                    <strong>{t.name}</strong>
                    <span>{t.skills?.join(', ')}</span>
                  </div>
                  <span className={`availability-dot ${t.availability.toLowerCase()}`}>{t.availability}</span>
                  <div className="talent-row__actions">
                    <Link to={`/agency/talent/${t._id}/edit`} className="btn btn--outline btn--sm">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
