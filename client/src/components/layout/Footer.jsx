import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PAYMENT_ICONS = [
  { id: 'visa',         label: 'Visa',         svg: 'V' },
  { id: 'mastercard',   label: 'Mastercard',   svg: 'M' },
  { id: 'apple_pay',    label: 'Apple Pay',    svg: '🍎' },
  { id: 'google_pay',   label: 'Google Pay',   svg: 'G' },
  { id: 'mada',         label: 'mada',         svg: 'م' },
  { id: 'tabby',        label: 'Tabby',        svg: 'T' },
  { id: 'tamara',       label: 'Tamara',       svg: 'T' },
  { id: 'cash',         label: 'Cash',         svg: '💵' },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__inner">

          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">{t('brand')}</Link>
            <p className="footer__tagline">{t('tagline')}</p>
            <p className="footer__origin">🇶🇦 {t('footer.madeIn')}</p>
          </div>

          {/* Marketplace links */}
          <div className="footer__col">
            <h4>{t('footer.marketplace')}</h4>
            <Link to="/shops"         >{t('footer.browseShops')}</Link>
            <Link to="/shop/dashboard">{t('footer.openShop')}</Link>
            <Link to="/shops"         >{t('footer.newArrivals')}</Link>
          </div>

          {/* Company links */}
          <div className="footer__col">
            <h4>{t('footer.company')}</h4>
            <Link to="/about"  >{t('footer.about')}</Link>
            <Link to="/browse" >{t('footer.talent')}</Link>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4>{t('footer.contact')}</h4>
            <a href="mailto:hello@linesbyams.qa">hello@linesbyams.qa</a>
            <a href="https://wa.me/97412345678" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="https://www.instagram.com/linesbyams" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>

      {/* Payment strip */}
      <div className="footer__payments">
        <div className="container footer__payments-inner">
          <span className="footer__payments-label">{t('footer.payments')}</span>
          <div className="footer__payment-icons">
            {PAYMENT_ICONS.map(({ id, label, svg }) => (
              <div key={id} className="footer__payment-chip" title={label}>
                <span>{svg}</span>
                <small>{label}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {new Date().getFullYear()} Lines By AMS. {t('footer.rights')}</span>
          <div className="footer__bottom-links">
            <Link to="/about">About</Link>
            <span>·</span>
            <a href="mailto:hello@linesbyams.qa">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
