import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ROLE_BADGE = {
  admin:    'badge--gold',
  agency:   'badge--blue',
  customer: 'badge--green',
};

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.users || [])).finally(() => setLoading(false));
  }, []);

  const updateUser = async (id, patch) => {
    try {
      const r = await api.put(`/admin/users/${id}`, patch);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, ...r.data.user } : u));
      toast.success('User updated');
    } catch { toast.error('Update failed'); }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
    setConfirm(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : u.role === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar__title">Users</div>
          <div className="topbar__sub">{users.length} registered users</div>
        </div>
      </div>

      <div className="table-card">
        <div className="toolbar">
          <input className="search-input" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="customer">Customers</option>
            <option value="agency">Agencies</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-screen">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p>No users found.</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Location</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                      <div className="avatar">{user.name?.charAt(0)}</div>
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td style={{ color:'var(--muted)', fontSize:'.82rem' }}>{user.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[user.role] || 'badge--muted'}`}>{user.role}</span></td>
                  <td style={{ color:'var(--muted)' }}>{user.location || '—'}</td>
                  <td style={{ color:'var(--muted)', fontSize:'.78rem' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
                      {user.role !== 'admin' && (
                        <button className="btn btn--sm btn--ghost"
                          onClick={() => updateUser(user._id, { role: user.role === 'customer' ? 'agency' : 'customer' })}>
                          Make {user.role === 'customer' ? 'Agency' : 'Customer'}
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button className="btn btn--sm btn--danger" onClick={() => setConfirm(user)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirm && (
        <div className="modal-bg" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete User</h3>
            <p>Are you sure you want to permanently delete <strong>{confirm.name}</strong> ({confirm.email})?</p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={() => deleteUser(confirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
