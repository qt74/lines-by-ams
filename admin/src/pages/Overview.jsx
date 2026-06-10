import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Overview() {
  const [stats,  setStats]  = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data));
    api.get('/admin/shops?limit=5&sort=newest').then(r => setRecent(r.data.shops || []));
  }, []);

  const s = stats || {};

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar__title">Overview</div>
          <div className="topbar__sub">Lines By AMS — real-time platform stats</div>
        </div>
        <span style={{ fontSize:'.78rem', color:'var(--muted)' }}>
          {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </span>
      </div>

      <div className="stat-cards">
        <div className="stat-card stat-card--gold">
          <div className="stat-card__icon">🏪</div>
          <div className="stat-card__value">{s.totalShops ?? '—'}</div>
          <div className="stat-card__label">Total Shops</div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">📦</div>
          <div className="stat-card__value">{s.totalProducts ?? '—'}</div>
          <div className="stat-card__label">Total Products</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">👤</div>
          <div className="stat-card__value">{s.totalUsers ?? '—'}</div>
          <div className="stat-card__label">Registered Users</div>
        </div>
        <div className="stat-card stat-card--red">
          <div className="stat-card__icon">⭐</div>
          <div className="stat-card__value">{s.featuredShops ?? '—'}</div>
          <div className="stat-card__label">Featured Shops</div>
        </div>
      </div>

      {/* Recent shops */}
      <div className="table-card">
        <div className="table-card__header">
          <span className="table-card__title">Recently Added Shops</span>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state"><p>No shops yet.</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Category</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(shop => (
                <tr key={shop._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                      <div className="avatar">{shop.name?.charAt(0)}</div>
                      <strong>{shop.name}</strong>
                    </div>
                  </td>
                  <td>{shop.category || '—'}</td>
                  <td style={{ color:'var(--muted)' }}>{shop.owner?.name || '—'}</td>
                  <td>
                    {shop.isPremium
                      ? <span className="badge badge--gold">⭐ Featured</span>
                      : <span className="badge badge--green">Active</span>
                    }
                  </td>
                  <td>{shop.productCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
