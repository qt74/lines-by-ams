import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

const ALL_PAYMENT_METHODS = [
  { id: 'visa',          label: 'Visa',         icon: 'VISA' },
  { id: 'mastercard',    label: 'Mastercard',   icon: 'MC' },
  { id: 'paypal',        label: 'PayPal',       icon: 'PayPal' },
  { id: 'apple_pay',     label: 'Apple Pay',    icon: '🍎' },
  { id: 'google_pay',    label: 'Google Pay',   icon: 'G Pay' },
  { id: 'cash',          label: 'Cash',         icon: '💵' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [imgIdx,  setImgIdx]  = useState(0);
  const [loading, setLoading] = useState(true);
  const [selPay,  setSelPay]  = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data.product))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen">Loading…</div>;
  if (!product) return (
    <div className="container" style={{ padding:'4rem 0' }}>
      <p>Product not found.</p>
    </div>
  );

  const imgs = product.images?.length > 0 ? product.images : [];
  const shop = product.shop;

  const acceptedMethods = shop?.paymentMethods?.length
    ? ALL_PAYMENT_METHODS.filter(m => shop.paymentMethods.includes(m.id))
    : ALL_PAYMENT_METHODS.filter(m => ['cash', 'apple_pay', 'visa'].includes(m.id));

  const buildMsg = () => {
    const base = `Hi! I'm interested in "${product.name}" — ${Number(product.price).toLocaleString()} QAR.`;
    const pay  = selPay ? ` I'd like to pay with ${selPay}.` : '';
    return encodeURIComponent(base + pay + ' (via Lines By AMS)');
  };

  const waHref = shop?.whatsapp
    ? `https://wa.me/${shop.whatsapp.replace(/\D/g,'')}?text=${buildMsg()}`
    : null;

  return (
    <main>
      <div className="container" style={{ padding:'2.5rem 1rem', maxWidth:960 }}>

        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/shops">Shops</Link>
          {shop && <><span>/</span><Link to={`/shops/${shop._id}`}>{shop.name}</Link></>}
          <span>/</span><span>{product.name}</span>
        </nav>

        <div className="product-detail">

          {/* Gallery */}
          <div className="product-detail__gallery">
            <div className="product-detail__main-img">
              {imgs[imgIdx]
                ? <img src={imgs[imgIdx]} alt={product.name} />
                : <div className="product-card__img-placeholder" style={{ height:400 }}>📦</div>
              }
              {!product.inStock && <div className="product-oos-banner">Out of Stock</div>}
            </div>
            {imgs.length > 1 && (
              <div className="product-detail__thumbs">
                {imgs.map((src, i) => (
                  <img key={i} src={src} alt={`${i+1}`}
                    className={`product-detail__thumb ${i === imgIdx ? 'active' : ''}`}
                    onClick={() => setImgIdx(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail__info">
            {shop && (
              <Link to={`/shops/${shop._id}`} className="product-detail__shop-link">
                {shop.logo && <img src={shop.logo} alt={shop.name} />}
                <span>{shop.name}</span>
              </Link>
            )}

            <h1 className="product-detail__name">{product.name}</h1>

            <div className="product-detail__price-row">
              <span className="product-detail__price">{Number(product.price).toLocaleString()} QAR</span>
              {product.comparePrice > product.price && (
                <span className="product-detail__compare">{Number(product.comparePrice).toLocaleString()} QAR</span>
              )}
              {product.comparePrice > product.price && (
                <span className="product-detail__discount">
                  {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                </span>
              )}
            </div>

            <div className={`product-detail__stock ${product.inStock ? 'in' : 'out'}`}>
              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </div>

            {product.description && <p className="product-detail__desc">{product.description}</p>}
            {product.category    && <p className="product-detail__cat">Category: <strong>{product.category}</strong></p>}

            {/* Payment method selector */}
            <div className="payment-selector">
              <p className="payment-selector__label">{t('payment.selectMethod')}</p>
              <div className="payment-selector__grid">
                {acceptedMethods.map(m => (
                  <button key={m.id}
                    className={`payment-method-btn ${selPay === m.label ? 'active' : ''}`}
                    onClick={() => setSelPay(prev => prev === m.label ? null : m.label)}
                  >
                    <span className="payment-method-btn__icon">{m.icon}</span>
                    <span className="payment-method-btn__label">{m.label}</span>
                  </button>
                ))}
              </div>
              {selPay && <p className="payment-selector__selected">✓ {selPay} selected</p>}
            </div>

            {/* CTAs */}
            <div className="product-detail__actions">
              {waHref ? (
                <a href={waHref} target="_blank" rel="noreferrer"
                  className="btn btn--solid btn--lg" style={{ width:'100%', textAlign:'center' }}>
                  💬 {t('payment.buyWhatsApp')}
                </a>
              ) : shop?.phone ? (
                <a href={`tel:${shop.phone}`} className="btn btn--solid btn--lg"
                  style={{ width:'100%', textAlign:'center' }}>
                  📞 Contact to Order
                </a>
              ) : (
                <Link to={`/shops/${shop?._id}`} className="btn btn--solid btn--lg"
                  style={{ width:'100%', textAlign:'center' }}>
                  Visit Shop to Order
                </Link>
              )}
              <Link to={`/shops/${shop?._id}`} className="btn btn--outline btn--lg"
                style={{ width:'100%', textAlign:'center' }}>
                🏪 View Shop
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
