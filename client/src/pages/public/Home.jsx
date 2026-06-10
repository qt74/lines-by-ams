import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

const CATEGORIES = [
  { labelKey: 'Abayas',        labelAr: 'عبايات',      emoji: '🪷' },
  { labelKey: 'Modest Wear',   labelAr: 'الأزياء المحتشمة', emoji: '👘' },
  { labelKey: 'Accessories',   labelAr: 'إكسسوارات',   emoji: '💍' },
  { labelKey: 'Bags & Purses', labelAr: 'الحقائب',     emoji: '👜' },
  { labelKey: 'Shoes',         labelAr: 'الأحذية',     emoji: '👠' },
  { labelKey: 'Kids Fashion',  labelAr: 'أزياء الأطفال', emoji: '🧒' },
  { labelKey: 'Perfumes',      labelAr: 'العطور',      emoji: '🌸' },
  { labelKey: 'Home Decor',    labelAr: 'ديكور المنزل', emoji: '🕌' },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [shops,    setShops]    = useState([]);
  const [products, setProducts] = useState([]);
  const [stats,    setStats]    = useState({ shops: 0, products: 0 });

  useEffect(() => {
    api.get('/shops?limit=6&approved=true').then(r => {
      setShops(r.data.shops || []);
      setStats(s => ({ ...s, shops: r.data.total || r.data.shops?.length || 0 }));
    }).catch(() => {});

    api.get('/products?limit=8').then(r => {
      setProducts(r.data.products || []);
      setStats(s => ({ ...s, products: r.data.total || r.data.products?.length || 0 }));
    }).catch(() => {});
  }, []);

  return (
    <main>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__overlay" />
        <div className="container hero__content">
          <p className="hero__eyebrow">{t('home.eyebrow')}</p>
          <h1 className="hero__title">{t('home.heroTitle')}</h1>
          <p className="hero__sub">{t('home.heroSub')}</p>
          <div className="hero__actions">
            <Link to="/shops"          className="btn btn--solid btn--lg">{t('home.heroCta1')}</Link>
            <Link to="/shop/dashboard" className="btn btn--outline-white btn--lg">{t('home.heroCta2')}</Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-bar">
        <div className="container stats-bar__inner">
          <div className="stats-bar__item">
            <span className="stats-bar__num">{stats.shops > 0 ? stats.shops : '50+'}</span>
            <span className="stats-bar__label">{t('home.statsShops')}</span>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <span className="stats-bar__num">{stats.products > 0 ? stats.products : '500+'}</span>
            <span className="stats-bar__label">{t('home.statsProducts')}</span>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <span className="stats-bar__num">{t('home.statsLocation')}</span>
            <span className="stats-bar__label">{t('home.statsLocationSub')}</span>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <span className="stats-bar__num">{t('home.statsFree')}</span>
            <span className="stats-bar__label">{t('home.statesFreeSub')}</span>
          </div>
        </div>
      </section>

      {/* ── CATEGORY CHIPS ── */}
      <section className="skills-bar">
        <div className="container skills-bar__inner">
          {CATEGORIES.map(({ labelKey, labelAr, emoji }) => (
            <Link
              key={labelKey}
              to={`/shops?category=${encodeURIComponent(labelKey)}`}
              className="skill-chip"
            >
              <span className="skill-chip__emoji">{emoji}</span>
              {isAr ? labelAr : labelKey}
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED SHOPS ── */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">{t('home.featuredShops')}</h2>
            <Link to="/shops" className="btn btn--ghost btn--sm">{t('home.viewAll')}</Link>
          </div>
          {shops.length > 0 ? (
            <div className="shops-grid">
              {shops.map(shop => <ShopCard key={shop._id} shop={shop} />)}
            </div>
          ) : (
            <div className="home-empty-state">
              <p>{t('home.emptyShops')} <Link to="/shop/dashboard">{t('home.openShopLink')}</Link></p>
            </div>
          )}
        </div>
      </section>

      {/* ── LATEST PRODUCTS ── */}
      {products.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">{t('home.newArrivals')}</h2>
              <Link to="/shops" className="btn btn--ghost btn--sm">{t('home.shopAll')}</Link>
            </div>
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="section section--alt">
        <div className="container">
          <h2 className="section__title" style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            {t('home.howTitle')}
          </h2>
          <div className="steps-grid">
            {[
              { n:1, icon:'🏪', titleKey:'home.step1Title', descKey:'home.step1Desc' },
              { n:2, icon:'📸', titleKey:'home.step2Title', descKey:'home.step2Desc' },
              { n:3, icon:'🛍️', titleKey:'home.step3Title', descKey:'home.step3Desc' },
              { n:4, icon:'💬', titleKey:'home.step4Title', descKey:'home.step4Desc' },
            ].map(({ n, icon, titleKey, descKey }) => (
              <div className="step-card" key={n}>
                <div className="step-card__icon">{icon}</div>
                <div className="step-card__num">0{n}</div>
                <h3 className="step-card__title">{t(titleKey)}</h3>
                <p className="step-card__desc">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="section">
        <div className="container">
          <h2 className="section__title" style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            {t('home.whyTitle')}
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">🆓</div>
              <h3>{t('home.why1Title')}</h3>
              <p>{t('home.why1Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">🇶🇦</div>
              <h3>{t('home.why2Title')}</h3>
              <p>{t('home.why2Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">📱</div>
              <h3>{t('home.why3Title')}</h3>
              <p>{t('home.why3Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">🌟</div>
              <h3>{t('home.why4Title')}</h3>
              <p>{t('home.why4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAYMENT METHODS ── */}
      <section className="home-payments section--alt">
        <div className="container home-payments__inner">
          <p className="home-payments__label">{t('home.paymentTitle')}</p>
          <div className="home-payments__icons">
            {[
              { id:'visa',        label:'Visa',        badge:'VISA' },
              { id:'mastercard',  label:'Mastercard',  badge:'MC' },
              { id:'apple_pay',   label:'Apple Pay',   badge:'🍎 Pay' },
              { id:'google_pay',  label:'Google Pay',  badge:'G Pay' },
              { id:'mada',        label:'mada',        badge:'مدى' },
              { id:'tabby',       label:'Tabby',       badge:'tabby' },
              { id:'tamara',      label:'Tamara',      badge:'tamara' },
              { id:'cash',        label:'Cash',        badge:'💵 Cash' },
            ].map(({ id, label, badge }) => (
              <div key={id} className="payment-badge" title={label}>{badge}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <h2>{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaSub')}</p>
          <div className="cta-banner__actions">
            <Link to="/shop/dashboard" className="btn btn--solid btn--lg">{t('home.ctaBtn1')}</Link>
            <Link to="/shops"          className="btn btn--outline-white btn--lg">{t('home.ctaBtn2')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ShopCard({ shop }) {
  return (
    <Link to={`/shops/${shop._id}`} className="shop-card">
      <div className="shop-card__cover">
        {shop.coverImage
          ? <img src={shop.coverImage} alt={shop.name} />
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

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card__img">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} />
          : <div className="product-card__img-placeholder">📦</div>
        }
      </div>
      <div className="product-card__body">
        <p className="product-card__shop">{product.shop?.name}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">{Number(product.price).toLocaleString()} QAR</p>
      </div>
    </Link>
  );
}
