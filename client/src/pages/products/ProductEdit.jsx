import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => {
        const p = r.data.product;
        setForm({
          name: p.name || '',
          price: p.price || '',
          comparePrice: p.comparePrice || '',
          category: p.category || '',
          description: p.description || '',
          images: p.images?.[0] || '',
          inStock: p.inStock !== false,
        });
      })
      .catch(() => { toast.error('Product not found'); navigate('/shop/dashboard'); });
  }, [id]);

  const f = (k) => (e) => setForm(v => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, images: form.images ? [form.images] : [] };
      await api.put(`/products/${id}`, payload);
      toast.success('Product updated!');
      navigate('/shop/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  if (!form) return <div className="loading-screen">Loading…</div>;

  return (
    <main className="dashboard-page">
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link to="/shop/dashboard" className="btn btn--ghost btn--sm">← Back</Link>
          <h1>Edit Product</h1>
        </div>
        <form onSubmit={submit} className="form-card">
          <label>Product Name *
            <input value={form.name} onChange={f('name')} required placeholder="e.g. Handmade Abaya - Black" />
          </label>
          <label>Price (QAR) *
            <input type="number" min="0" value={form.price} onChange={f('price')} required placeholder="150" />
          </label>
          <label>Original Price (optional — shows crossed out)
            <input type="number" min="0" value={form.comparePrice} onChange={f('comparePrice')} placeholder="200" />
          </label>
          <label>Category
            <input value={form.category} onChange={f('category')} placeholder="e.g. Abayas" />
          </label>
          <label>Description
            <textarea value={form.description} onChange={f('description')} rows={3} placeholder="Describe the product…" />
          </label>
          <label>Product Image URL
            <input value={form.images} onChange={f('images')} placeholder="https://… (paste image link)" />
          </label>
          <label style={{ flexDirection: 'row', alignItems: 'center', gap: '.5rem' }}>
            <input type="checkbox" checked={form.inStock} onChange={e => setForm(v => ({ ...v, inStock: e.target.checked }))} />
            In Stock
          </label>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button className="btn btn--solid" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link to="/shop/dashboard" className="btn btn--outline" style={{ flex: 1, textAlign: 'center' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
