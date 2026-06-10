import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

export default function ShopDetail() {
  const { id } = useParams();
  const [shop,     setShop]     = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get(`/shops/${id}`)
      .then(r => { setShop(r.data.shop); setProducts(r.data.products || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen">Loading…</div>;
  if (!shop)   return <div className="container" style={{padding:'4rem 0'}}><p>Shop not found.</p></div>;

  return (
    <main>
      {/* Shop hero cover */}
      <div className="shop-hero">
        {shop.coverImage
          ? <img src={shop.coverImage} alt={shop.name} className="shop-hero__img" />
          : <div className="shop-hero__placeholder" />
        }
        <div className="shop-hero__overlay" />
      </div>

      <div className="container">
        {/* Shop header */}
        <div className="shop-profile-header">
          <div className="shop-profile-logo">
            {shop.logo
              ? <img src={shop.logo} alt={shop.name} />
              : <span>{shop.name?.charAt(0)}</span>
            }
          </div>
          <div className="shop-profile-info">
            <div style={{ display:'flex', alignItems:'center', gap:'.6rem', flexWrap:'wrap' }}>
              <h1 className="shop-profile-name">{shop.name}</h1>
              {shop.isPremium && <span className="badge badge--gold">⭐ Featured</span>}
            </div>
            <p className="shop-profile-cat">{shop.category || 'Fashion'} · {shop.location}</p>
            {shop.description && <p className="shop-profile-desc">{shop.description}</p>}

            {/* Contact links */}
            <div className="shop-profile-contacts">
              {shop.whatsapp && (
                <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn btn--solid btn--sm">
                  💬 WhatsApp
                </a>
              )}
              {shop.instagram && (
                <a href={`https://instagram.com/${shop.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="btn btn--outline btn--sm">
                  📸 Instagram
                </a>
              )}
              {shop.phone && (
                <a href={`tel:${shop.phone}`} className="btn btn--outline btn--sm">📞 Call</a>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <section style={{ marginTop:'2.5rem' }}>
          <div className="section__header">
            <h2 className="section__title">Products ({products.length})</h2>
          </div>

          {products.length === 0 ? (
            <div className="home-empty-state"><p>No products listed yet.</p></div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card__img">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} loading="lazy" />
          : <div className="product-card__img-placeholder">📦</div>
        }
        {!product.inStock && (
          <div className="product-card__oos">Out of stock</div>
        )}
        {product.comparePrice > product.price && (
          <div className="product-card__sale">SALE</div>
        )}
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__prices">
          <span className="product-card__price">{Number(product.price).toLocaleString()} QAR</span>
          {product.comparePrice > product.price && (
            <span className="product-card__compare">{Number(product.comparePrice).toLocaleString()} QAR</span>
          )}
        </div>
      </div>
    </Link>
  );
}
