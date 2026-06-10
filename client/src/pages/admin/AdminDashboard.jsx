import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import toast from 'react-hot-toast';

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
            </nav>
          </aside>
          <div className="admin-main">
            <Routes>
              <Route index                 element={<AdminOverview />} />
              <Route path="agencies"       element={<AdminAgencies />} />
              <Route path="users"          element={<AdminUsers />} />
              <Route path="employments"    element={<AdminEmployments />} />
            </Routes>
          </div>
        </div>
      </div>
    </main>
  );
}

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
        <div className="stat-card"><div className="stat-card__value">{stats.totalUsers}</div><div className="stat-card__label">Total Users</div></div>
        <div className="stat-card"><div className="stat-card__value">{stats.totalAgencies}</div><div className="stat-card__label">Approved Agencies</div></div>
        <div className="stat-card"><div className="stat-card__value">{stats.totalEmployments}</div><div className="stat-card__label">Total Hirings</div></div>
        <div className="stat-card"><div className="stat-card__value">{stats.completedEmployments}</div><div className="stat-card__label">Completed Hirings</div></div>
        <div className="stat-card"><div className="stat-card__value">{(stats.totalVolume ?? 0).toLocaleString()} QAR</div><div className="stat-card__label">Total Volume</div></div>
        <div className="stat-card"><div className="stat-card__value">{(stats.totalRevenue ?? 0).toLocaleString()} QAR</div><div className="stat-card__label">Platform Revenue (10%)</div></div>
      </div>
    </div>
  );
}

function AdminAgencies() {
  const { t } = useTranslation();
  const [agencies, setAgencies] = useState([]);
  useEffect(() => {
    api.get('/admin/agencies').then(r => setAgencies(r.data.agencies)).catch(() => {});
  }, []);

  const approve = async (id, approved) => {
    try {
      const res = await api.patch(`/admin/agencies/${id}/approve`, { approved });
      setAgencies(prev => prev.map(a => a._id === id ? res.data.agency : a));
      toast.success(approved ? 'Agency approved' : 'Agency rejected');
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h1>{t('admin.agencies')}</h1>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Agency</th><th>Owner</th><th>Status</th><th>Placements</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {agencies.map(a => (
              <tr key={a._id}>
                <td><strong>{a.agencyName}</strong></td>
                <td>{a.user?.name}<br/><small>{a.user?.email}</small></td>
                <td><span className={`badge ${a.isApproved ? 'badge--green' : 'badge--yellow'}`}>{a.isApproved ? 'Approved' : 'Pending'}</span></td>
                <td>{a.totalPlacements}</td>
                <td>
                  {!a.isApproved && <button className="btn btn--solid btn--sm" onClick={() => approve(a._id, true)}>{t('admin.approve')}</button>}
                  {a.isApproved  && <button className="btn btn--outline btn--sm" onClick={() => approve(a._id, false)}>{t('admin.reject')}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.users)).catch(() => {});
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
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.role}</span></td>
                <td><span className={`badge ${u.isActive ? 'badge--green' : 'badge--red'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                <td>
                  <button className={`btn btn--sm ${u.isActive ? 'btn--outline' : 'btn--solid'}`} onClick={() => toggle(u._id)}>
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

function AdminEmployments() {
  const { t } = useTranslation();
  const [employments, setEmployments] = useState([]);
  useEffect(() => {
    api.get('/admin/employments').then(r => setEmployments(r.data.employments)).catch(() => {});
  }, []);

  return (
    <div>
      <h1>{t('admin.employments')}</h1>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Talent</th><th>Customer</th><th>Agency</th><th>Status</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {employments.map(e => (
              <tr key={e._id}>
                <td>{e.talent?.name}</td>
                <td>{e.customer?.name}</td>
                <td>{e.agency?.agencyName}</td>
                <td><span className="badge">{t(`employment.statuses.${e.status}`)}</span></td>
                <td>{e.agreedSalary ? `${e.agreedSalary.toLocaleString()} QAR` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
