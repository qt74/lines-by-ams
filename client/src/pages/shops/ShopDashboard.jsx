import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ShopDashboard() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [shop,       setShop]       = useState(null);
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('products'); // products | settings
  const [showAddProd,setShowAddProd]= useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/shops/my'),
      api.get('/products/my'),
    ]).then(([sRes, pRes]) => {
      setShop(sRes.data.shop);
      setProducts(pRes.data.products || []);
    }).catch(() => toast.error('Failed to load shop'))
      .finally(() => setLoading(false));
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="loading-screen">Loading your shop…</div>;

  // No shop yet → prompt to create one
  if (!shop) return <CreateShopForm onCreated={s => { setShop(s); }} />;

  return (
    <main className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>My Shop</h1>
            <p>Welcome back, <strong>{shop.name}</strong></p>
          </div>
          <div style={{ display:'flex', gap:'.75rem' }}>
            <Link to={`/shops/${shop._id}`} className="btn btn--outline btn--sm" target="_blank">View Shop ↗</Link>
            <button className="btn btn--solid btn--sm" onClick={() => setShowAddProd(true)}>+ Add Product</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-card__value">{products.length}</div><div className="stat-card__label">Products</div></div>
          <div className="stat-card"><div className="stat-card__value">{shop.views || 0}</div><div className="stat-card__label">Shop Views</div></div>
          <div className="stat-card"><div className="stat-card__value">{products.reduce((a,p) => a + (p.orders||0), 0)}</div><div className="stat-card__label">Total Orders</div></div>
          <div className="stat-card"><div className="stat-card__value">{shop.isPremium ? '⭐ Yes' : 'No'}</div><div className="stat-card__label">Featured</div></div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button className={`dash-tab ${tab==='products'?'active':''}`} onClick={() => setTab('products')}>Products ({products.length})</button>
          <button className={`dash-tab ${tab==='settings'?'active':''}`} onClick={() => setTab('settings')}>Shop Settings</button>
        </div>

        {/* Products tab */}
        {tab === 'products' && (
          <section className="dashboard-section">
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products yet.</p>
                <button className="btn btn--solid" onClick={() => setShowAddProd(true)}>Add your first product</button>
              </div>
            ) : (
              <div className="products-manage-list">
                {products.map(p => (
                  <div key={p._id} className="product-manage-row">
                    <div className="product-manage-row__img">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : <span>📦</span>}
                    </div>
                    <div className="product-manage-row__info">
                      <strong>{p.name}</strong>
                      <span>{Number(p.price).toLocaleString()} QAR</span>
                      <span className={`availability-dot ${p.inStock ? 'available' : 'unavailable'}`}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="product-manage-row__actions">
                      <Link to={`/products/${p._id}`} className="btn btn--outline btn--sm">View</Link>
                      <Link to={`/shop/products/${p._id}/edit`} className="btn btn--outline btn--sm">Edit</Link>
                      <button className="btn btn--sm" style={{color:'var(--red)',border:'1px solid var(--red)'}} onClick={() => deleteProduct(p._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Settings tab */}
        {tab === 'settings' && <ShopSettingsForm shop={shop} onUpdate={s => setShop(s)} />}

        {/* Add product modal */}
        {showAddProd && (
          <AddProductModal
            onClose={() => setShowAddProd(false)}
            onAdded={p => { setProducts(prev => [p, ...prev]); setShowAddProd(false); }}
          />
        )}
      </div>
    </main>
  );
}

/* ── Create shop form ─────────────────────────────────────────────────────── */
function CreateShopForm({ onCreated }) {
  const [form, setForm] = useState({ name:'', category:'Fashion', description:'', whatsapp:'', instagram:'', location:'Qatar', paymentMethods:['cash','apple_pay','visa'] });
  const [saving, setSaving] = useState(false);
  const f = (k) => (e) => setForm(v => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/shops', form);
      toast.success('Shop created!');
      onCreated(res.data.shop);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shop');
    } finally { setSaving(false); }
  };

  return (
    <main className="dashboard-page">
      <div className="container" style={{ maxWidth: 560 }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Create Your Shop</h1>
        <p style={{ color:'var(--gray-500)', marginBottom:'2rem' }}>
          Set up your boutique in minutes. It's completely free.
        </p>
        <form onSubmit={submit} className="form-card">
          <label>Shop Name *
            <input value={form.name} onChange={f('name')} placeholder="e.g. Nour's Abayas" required />
          </label>
          <label>Category
            <select value={form.category} onChange={f('category')}>
              {['Fashion','Abayas','Modest Wear','Accessories','Bags & Purses','Shoes','Kids Fashion','Perfumes','Jewellery','Home Decor'].map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Description
            <textarea value={form.description} onChange={f('description')} rows={3} placeholder="Tell customers about your boutique…" />
          </label>
          <label>WhatsApp Number
            <input value={form.whatsapp} onChange={f('whatsapp')} placeholder="+974 5000 0000" />
          </label>
          <label>Instagram Handle
            <input value={form.instagram} onChange={f('instagram')} placeholder="@myboutique" />
          </label>
          <label>Location
            <input value={form.location} onChange={f('location')} placeholder="Doha, Qatar" />
          </label>
          <button className="btn btn--solid" disabled={saving} style={{ width:'100%', marginTop:'.5rem' }}>
            {saving ? 'Creating…' : 'Create My Shop →'}
          </button>
        </form>
      </div>
    </main>
  );
}

const PAYMENT_OPTIONS = [
  { id:'visa',         label:'Visa'         },
  { id:'mastercard',   label:'Mastercard'   },
  { id:'paypal',       label:'PayPal'       },
  { id:'apple_pay',    label:'Apple Pay'    },
  { id:'google_pay',   label:'Google Pay'   },
  { id:'cash',         label:'Cash'         },
];

/* ── Shop settings form ───────────────────────────────────────────────────── */
function ShopSettingsForm({ shop, onUpdate }) {
  const [form, setForm] = useState({
    name: shop.name || '', category: shop.category || 'Fashion',
    description: shop.description || '', whatsapp: shop.whatsapp || '',
    instagram: shop.instagram || '', phone: shop.phone || '',
    location: shop.location || 'Qatar',
    paymentMethods: shop.paymentMethods || ['cash','bank_transfer'],
  });
  const [saving, setSaving] = useState(false);
  const f = (k) => (e) => setForm(v => ({ ...v, [k]: e.target.value }));

  const togglePayment = (id) => {
    setForm(v => ({
      ...v,
      paymentMethods: v.paymentMethods.includes(id)
        ? v.paymentMethods.filter(x => x !== id)
        : [...v.paymentMethods, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/shops/${shop._id}`, form);
      toast.success('Settings saved!');
      onUpdate(res.data.shop);
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="form-card" style={{ marginTop:'1rem' }}>
      <label>Shop Name<input value={form.name} onChange={f('name')} required /></label>
      <label>Category
        <select value={form.category} onChange={f('category')}>
          {['Fashion','Abayas','Modest Wear','Accessories','Bags & Purses','Shoes','Kids Fashion','Perfumes','Jewellery','Home Decor'].map(c=><option key={c}>{c}</option>)}
        </select>
      </label>
      <label>Description<textarea value={form.description} onChange={f('description')} rows={3} /></label>
      <label>WhatsApp<input value={form.whatsapp} onChange={f('whatsapp')} placeholder="+974 5000 0000" /></label>
      <label>Instagram<input value={form.instagram} onChange={f('instagram')} placeholder="@myboutique" /></label>
      <label>Phone<input value={form.phone} onChange={f('phone')} /></label>
      <label>Location<input value={form.location} onChange={f('location')} /></label>

      {/* Payment methods */}
      <div>
        <p style={{ fontSize:'.85rem', fontWeight:500, marginBottom:'.6rem', color:'var(--gray-700)' }}>
          Accepted Payment Methods
        </p>
        <p style={{ fontSize:'.78rem', color:'var(--gray-500)', marginBottom:'.75rem' }}>
          Select all payment methods you accept from customers.
        </p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem' }}>
          {PAYMENT_OPTIONS.map(({ id, label }) => (
            <button key={id} type="button"
              onClick={() => togglePayment(id)}
              style={{
                padding:'.35rem .85rem',
                borderRadius:'2rem',
                fontSize:'.8rem',
                fontWeight:500,
                cursor:'pointer',
                border: form.paymentMethods.includes(id)
                  ? '1.5px solid var(--black)'
                  : '1.5px solid var(--gray-300)',
                background: form.paymentMethods.includes(id) ? 'var(--black)' : 'var(--white)',
                color:       form.paymentMethods.includes(id) ? 'var(--white)' : 'var(--gray-600)',
                transition: 'all .15s',
              }}
            >
              {form.paymentMethods.includes(id) ? '✓ ' : ''}{label}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn--solid" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
    </form>
  );
}

/* ── Add product modal ────────────────────────────────────────────────────── */
function AddProductModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name:'', price:'', comparePrice:'', category:'', description:'', images:'', inStock:true });
  const [saving, setSaving] = useState(false);
  const f = (k) => (e) => setForm(v => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, images: form.images ? [form.images] : [] };
      const res = await api.post('/products', payload);
      toast.success('Product added!');
      onAdded(res.data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2>Add Product</h2>
          <button className="modal-card__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <label>Product Name *<input value={form.name} onChange={f('name')} required placeholder="e.g. Handmade Abaya - Black" /></label>
          <label>Price (QAR) *<input type="number" min="0" value={form.price} onChange={f('price')} required placeholder="150" /></label>
          <label>Original Price (optional — shows crossed out)<input type="number" min="0" value={form.comparePrice} onChange={f('comparePrice')} placeholder="200" /></label>
          <label>Category<input value={form.category} onChange={f('category')} placeholder="e.g. Abayas" /></label>
          <label>Description<textarea value={form.description} onChange={f('description')} rows={2} placeholder="Describe the product…" /></label>
          <label>Product Image URL<input value={form.images} onChange={f('images')} placeholder="https://… (paste image link)" /></label>
          <label style={{flexDirection:'row',alignItems:'center',gap:'.5rem'}}>
            <input type="checkbox" checked={form.inStock} onChange={e => setForm(v=>({...v,inStock:e.target.checked}))} />
            In Stock
          </label>
          <button className="btn btn--solid" disabled={saving} style={{width:'100%',marginTop:'.5rem'}}>
            {saving ? 'Adding…' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
