import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">{t('brand')}</span>
          <p>{t('tagline')}</p>
        </div>
        <div className="footer__col">
          <h4>Platform</h4>
          <Link to="/browse">Browse Talent</Link>
          <Link to="/register">Join as Agency</Link>
          <Link to="/register">Hire Talent</Link>
        </div>
        <div className="footer__col">
          <h4>Contact</h4>
          <a href="mailto:hello@linesbyams.qa">hello@linesbyams.qa</a>
          <a href="https://wa.me/97412345678" target="_blank" rel="noopener">WhatsApp</a>
          <a href="https://www.instagram.com/linesbyams" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <div className="footer__bottom container">
        <span>© {new Date().getFullYear()} Lines By AMS. All rights reserved.</span>
      </div>
    </footer>
  );
}
