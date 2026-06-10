import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';

const CATS = ['Abayas','Modest Wear','Accessories','Bags & Purses','Shoes','Kids Fashion','Perfumes','Home Decor','Jewellery','Sports Wear'];

export default function BrowseShops() {
  const [params, setParams] = useSearchParams();
  const [shops,   setShops]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  const search   = params.get('search')   || '';
  const category = params.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ limit: 24, approved: true });
    if (search)   q.set('search',   search);
    if (category) q.set('category', category);

    api.get(`/shops?${q}`).then(r => {
      setShops(r.data.shops  || []);
      setTotal(r.data.total  || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [search, category]);

  const set = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    setParams(next);
  };

  return (
    <main className="browse-page">
      <div className="container">
        <h1 className="browse-page__title">Browse Fashion Shops</h1>
        <p className="browse-page__sub">{loading ? '…' : `${total} boutiques found`}</p>

        {/* Filters */}
        <div className="browse-filters">
          <input
            className="filter-search"
            placeholder="Search shops…"
            value={search}
            onChange={e => set('search', e.target.value)}
          />
          <select value={category} onChange={e => set('category', e.target.value)} className="filter-select">
            <option value="">All Categories</option>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          {(search || category) && (
            <button className="btn btn--ghost btn--sm" onClick={() => setParams({})}>Clear</button>
          )}
        </div>

        {/* Category chips */}
        {!category && !search && (
          <div className="cat-chips">
            {CATS.map(c => (
              <button key={c} className="cat-chip" onClick={() => set('category', c)}>{c}</button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="loading-screen">Loading shops…</div>
        ) : shops.length === 0 ? (
          <div className="browse-empty">
            <p>No shops found. <Link to="/register">Open the first one →</Link></p>
          </div>
        ) : (
          <div className="shops-grid">
            {shops.map(shop => <ShopCard key={shop._id} shop={shop} />)}
          </div>
        )}
      </div>
    </main>
  );
}

function ShopCard({ shop }) {
  return (
    <Link to={`/shops/${shop._id}`} className="shop-card">
      <div className="shop-card__cover">
        {shop.coverImage
          ? <img src={shop.coverImage} alt={shop.name} loading="lazy" />
          : <div className="shop-card__cover-placeholder">🏪</div>
        }
        {shop.isPremium && <span className="shop-card__badge">⭐ Featured</span>}
      </div>
      <div className="shop-card__body">
        <div className="shop-card__avatar">
          {shop.logo ? <img src={shop.logo} alt="" /> : <span>{shop.name?.charAt(0)}</span>}
        </div>
        <h3 className="shop-card__name">{shop.name}</h3>
        <p className="shop-card__category">{shop.category || 'Fashion'}</p>
        {shop.productCount > 0 && <p className="shop-card__meta">{shop.productCount} products</p>}
      </div>
    </Link>
  );
}
