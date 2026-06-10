import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [confirm,  setConfirm]  = useState(null);

  useEffect(() => {
    api.get('/admin/products').then(r => setProducts(r.data.products || [])).finally(() => setLoading(false));
  }, []);

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
    setConfirm(null);
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.shop?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar__title">Products</div>
          <div className="topbar__sub">{products.length} products listed</div>
        </div>
      </div>

      <div className="table-card">
        <div className="toolbar">
          <input className="search-input" placeholder="Search products or shops…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="loading-screen">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p>No products found.</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Shop</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" style={{ width:36,height:36,borderRadius:6,objectFit:'cover' }} />
                        : <div style={{ width:36,height:36,borderRadius:6,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}>📦</div>
                      }
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td style={{ color:'var(--muted)' }}>{p.shop?.name || '—'}</td>
                  <td><strong>{Number(p.price).toLocaleString()} QAR</strong></td>
                  <td style={{ color:'var(--muted)' }}>{p.category || '—'}</td>
                  <td>
                    {p.inStock
                      ? <span className="badge badge--green">In Stock</span>
                      : <span className="badge badge--red">Out of Stock</span>
                    }
                  </td>
                  <td>
                    <button className="btn btn--sm btn--danger" onClick={() => setConfirm(p)}>Delete</button>
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
            <h3>Delete Product</h3>
            <p>Are you sure you want to permanently delete <strong>{confirm.name}</strong>?</p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={() => deleteProduct(confirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
