import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Shops() {
  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [confirm, setConfirm] = useState(null); // { type:'delete'|'feature'|'suspend', shop }

  useEffect(() => {
    api.get('/admin/shops').then(r => setShops(r.data.shops || [])).finally(() => setLoading(false));
  }, []);

  const updateShop = async (id, patch) => {
    try {
      const r = await api.put(`/admin/shops/${id}`, patch);
      setShops(prev => prev.map(s => s._id === id ? { ...s, ...r.data.shop } : s));
      toast.success('Shop updated');
    } catch { toast.error('Update failed'); }
  };

  const deleteShop = async (id) => {
    try {
      await api.delete(`/admin/shops/${id}`);
      setShops(prev => prev.filter(s => s._id !== id));
      toast.success('Shop deleted');
    } catch { toast.error('Delete failed'); }
    setConfirm(null);
  };

  const filtered = shops.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
                        s.owner?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true
      : filter === 'featured' ? s.isPremium
      : filter === 'suspended' ? s.isActive === false
      : true;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar__title">Shops</div>
          <div className="topbar__sub">{shops.length} shops registered</div>
        </div>
      </div>

      <div className="table-card">
        <div className="toolbar">
          <input className="search-input" placeholder="Search shops or owners…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="featured">Featured ⭐</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-screen">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p>No shops found.</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Category</th>
                <th>Owner</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(shop => (
                <tr key={shop._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                      {shop.logo
                        ? <img src={shop.logo} alt="" style={{ width:32,height:32,borderRadius:'50%',objectFit:'cover' }} />
                        : <div className="avatar">{shop.name?.charAt(0)}</div>
                      }
                      <div>
                        <strong>{shop.name}</strong>
                        {shop.location && <div style={{ fontSize:'.72rem', color:'var(--muted)' }}>{shop.location}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{shop.category || '—'}</td>
                  <td style={{ color:'var(--muted)' }}>{shop.owner?.name || '—'}<br/><span style={{fontSize:'.72rem'}}>{shop.owner?.email}</span></td>
                  <td style={{ color:'var(--muted)', fontSize:'.82rem' }}>{shop.whatsapp || '—'}</td>
                  <td>
                    {shop.isPremium && <span className="badge badge--gold" style={{marginRight:'.3rem'}}>⭐ Featured</span>}
                    {shop.isActive === false
                      ? <span className="badge badge--red">Suspended</span>
                      : <span className="badge badge--green">Active</span>
                    }
                  </td>
                  <td>{shop.productCount ?? 0}</td>
                  <td>
                    <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
                      <button
                        className={`btn btn--sm ${shop.isPremium ? 'btn--ghost' : 'btn--success'}`}
                        onClick={() => updateShop(shop._id, { isPremium: !shop.isPremium })}
                      >
                        {shop.isPremium ? 'Unfeature' : '⭐ Feature'}
                      </button>
                      <button
                        className={`btn btn--sm ${shop.isActive === false ? 'btn--success' : 'btn--ghost'}`}
                        onClick={() => updateShop(shop._id, { isActive: shop.isActive === false })}
                      >
                        {shop.isActive === false ? 'Restore' : 'Suspend'}
                      </button>
                      <button className="btn btn--sm btn--danger" onClick={() => setConfirm({ type:'delete', item: shop })}>
                        Delete
                      </button>
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
            <h3>Delete Shop</h3>
            <p>Are you sure you want to permanently delete <strong>{confirm.item.name}</strong>? This cannot be undone.</p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={() => deleteShop(confirm.item._id)}>Delete permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
