import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// All skill categories (keep in sync with server/models/TalentProfile.js)
const ALL_SKILLS = [
  'Model', 'Stylist', 'Photographer', 'Videographer', 'Makeup Artist',
  'Hair Stylist', 'Fashion Designer', 'Seamstress / Tailor', 'Textile Artist',
  'Wardrobe Manager', 'Brand Ambassador', 'Social Media Influencer', 'Art Director',
  'Fashion Illustrator', 'Pattern Maker',
  'Boutique Owner', 'Retail Buyer', 'Visual Merchandiser',
];

export default function AdminDashboard() {
  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <h2>Admin Panel</h2>
            <nav>
              <Link to="/admin">Overview</Link>
              <Link to="/admin/agencies">Agencies</Link>
              <Link to="/admin/users">Users</Link>
              <Link to="/admin/employments">Employments</Link>
              <Link to="/admin/categories">Categories</Link>
            </nav>
          </aside>
          <div className="admin-main">
            <Routes>
              <Route index              element={<AdminOverview />} />
              <Route path="agencies"    element={<AdminAgencies />} />
              <Route path="users"       element={<AdminUsers />} />
              <Route path="employments" element={<AdminEmployments />} />
              <Route path="categories"  element={<AdminCategories />} />
            </Routes>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── OVERVIEW ─────────────────────────────────────────── */
function AdminOverview() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.stats)).catch(() => {});
  }, []);
  if (!stats) return <p>Loading stats...</p>;
  return (
    <div>
      <h1>Platform Overview</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalUsers}</div>
          <div className="stat-card__label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalAgencies}</div>
          <div className="stat-card__label">Approved Agencies</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalEmployments}</div>
          <div className="stat-card__label">Total Hirings</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.completedEmployments}</div>
          <div className="stat-card__label">Completed Hirings</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{(stats.totalVolume ?? 0).toLocaleString()} QAR</div>
          <div className="stat-card__label">Total Volume</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{(stats.totalRevenue ?? 0).toLocaleString()} QAR</div>
          <div className="stat-card__label">Platform Revenue (10%)</div>
        </div>
      </div>
    </div>
  );
}

/* ── AGENCIES ─────────────────────────────────────────── */
function AdminAgencies() {
  const { t } = useTranslation();
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    api.get('/admin/agencies').then(r => setAgencies(r.data.agencies || [])).catch(() => {});
  }, []);

  const approve = async (id, approved) => {
    try {
      const res = await api.patch(`/admin/agencies/${id}/approve`, { approved });
      setAgencies(prev => prev.map(a => a._id === id ? res.data.agency : a));
      toast.success(approved ? 'Agency approved ✅' : 'Agency rejected');
    } catch { toast.error('Failed'); }
  };

  const togglePremium = async (id) => {
    try {
      const res = await api.patch(`/admin/agencies/${id}/premium`);
      setAgencies(prev => prev.map(a => a._id === id ? res.data.agency : a));
      toast.success(res.data.agency.isPremium ? '⭐ Premium enabled' : 'Premium removed');
    } catch { toast.error('Failed to toggle premium'); }
  };

  return (
    <div>
      <h1>{t('admin.agencies')}</h1>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Agency</th>
              <th>Owner</th>
              <th>Approval</th>
              <th>Premium</th>
              <th>Placements</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map(a => (
              <tr key={a._id}>
                <td>
                  <strong>{a.agencyName}</strong>
                  {a.isPremium && <span className="badge badge--gold" style={{ marginLeft: '.4rem' }}>⭐ Premium</span>}
                </td>
                <td>
                  {a.user?.name}<br />
                  <small>{a.user?.email}</small>
                </td>
                <td>
                  <span className={`badge ${a.isApproved ? 'badge--green' : 'badge--yellow'}`}>
                    {a.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${a.isPremium ? 'badge--gold' : ''}`}>
                    {a.isPremium ? 'Premium' : 'Standard'}
                  </span>
                </td>
                <td>{a.totalPlacements}</td>
                <td style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {!a.isApproved && (
                    <button className="btn btn--solid btn--sm" onClick={() => approve(a._id, true)}>
                      Approve
                    </button>
                  )}
                  {a.isApproved && (
                    <button className="btn btn--outline btn--sm" onClick={() => approve(a._id, false)}>
                      Revoke
                    </button>
                  )}
                  <button
                    className={`btn btn--sm ${a.isPremium ? 'btn--outline' : 'btn--solid'}`}
                    onClick={() => togglePremium(a._id)}
                    title={a.isPremium ? 'Remove premium' : 'Set as premium (1 year)'}
                  >
                    {a.isPremium ? 'Remove ⭐' : '⭐ Set Premium'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── USERS ────────────────────────────────────────────── */
function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.users || [])).catch(() => {});
  }, []);

  const toggle = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h1>{t('admin.users')}</h1>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.role}</span></td>
                <td><small>{new Date(u.createdAt).toLocaleDateString()}</small></td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge--green' : 'badge--red'}`}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn--sm ${u.isActive ? 'btn--outline' : 'btn--solid'}`}
                    onClick={() => toggle(u._id)}
                  >
                    {u.isActive ? t('admin.suspend') : t('admin.activate')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── EMPLOYMENTS ──────────────────────────────────────── */
function AdminEmployments() {
  const navigate = useNavigate();
  const [employments, setEmployments] = useState([]);

  useEffect(() => {
    api.get('/admin/employments').then(r => setEmployments(r.data.employments || [])).catch(() => {});
  }, []);

  return (
    <div>
      <h1>Employments</h1>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Talent</th><th>Customer</th><th>Agency</th><th>Status</th><th>Amount</th><th>Date</th></tr>
          </thead>
          <tbody>
            {employments.map(e => (
              <tr key={e._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/agency/employment/${e._id}`)}>
                <td>{e.talent?.name || '—'}</td>
                <td>{e.customer?.name}<br/><small>{e.customer?.email}</small></td>
                <td>{e.agency?.agencyName || '—'}</td>
                <td><span className="badge">{e.status}</span></td>
                <td>{e.agreedSalary ? `${e.agreedSalary.toLocaleString()} QAR` : '—'}</td>
                <td><small>{new Date(e.createdAt).toLocaleDateString()}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── CATEGORIES ───────────────────────────────────────── */
function AdminCategories() {
  return (
    <div>
      <h1>Talent Categories</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        These are the skill categories available on the platform. To add a new category, update
        the <code>SKILLS</code> array in three files and redeploy (see guide below).
      </p>

      <div className="categories-grid">
        {ALL_SKILLS.map(skill => (
          <div key={skill} className="category-chip">
            <span className="category-chip__name">{skill}</span>
          </div>
        ))}
      </div>

      <div className="detail-section" style={{ marginTop: '2rem' }}>
        <h2>How to Add a New Category</h2>
        <ol style={{ lineHeight: '2', paddingLeft: '1.5rem', color: 'var(--gray-600)' }}>
          <li>
            Open <code>server/models/TalentProfile.js</code> → add the string to the <code>skills enum</code> array
          </li>
          <li>
            Open <code>client/src/pages/agency/TalentForm.jsx</code> → add the same string to the <code>SKILLS</code> array
          </li>
          <li>
            Open <code>client/src/pages/public/Browse.jsx</code> → add to the <code>SKILLS</code> array
          </li>
          <li>
            Optionally add it to <code>client/src/pages/public/Home.jsx</code> SKILL_CHIPS for the homepage quick-filter
          </li>
          <li>Commit, push, and redeploy</li>
        </ol>
      </div>
    </div>
  );
}
