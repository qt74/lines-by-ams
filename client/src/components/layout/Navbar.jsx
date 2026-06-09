import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('fm_lang', next);
    document.documentElement.dir  = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  const handleLogout = () => { logout(); navigate('/'); };
  const close = () => setMenuOpen(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin')  return '/admin';
    if (user.role === 'agency') return '/agency/dashboard';
    return '/dashboard';
  };

  const getProfilePath = () => {
    if (!user) return '/login';
    if (user.role === 'agency') return '/agency/profile';
    return '/profile';
  };

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">{t('brand')}</Link>

        <ul className={`navbar__links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/"       onClick={close}>{t('nav.home')}</Link></li>
          <li><Link to="/browse" onClick={close}>{t('nav.browse')}</Link></li>

          {!user && (
            <>
              <li>
                <Link to="/login"    className="btn btn--outline btn--sm" onClick={close}>
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn--solid btn--sm" onClick={close}>
                  {t('nav.register')}
                </Link>
              </li>
            </>
          )}

          {user && (
            <>
              <li>
                <Link to={getDashboardPath()} onClick={close}>{t('nav.dashboard')}</Link>
              </li>
              {user.role !== 'admin' && (
                <li>
                  <Link to={getProfilePath()} className="navbar__profile-link" onClick={close}>
                    <span className="navbar__avatar">{user.name?.charAt(0).toUpperCase()}</span>
                    {t('nav.profile', 'My Profile')}
                  </Link>
                </li>
              )}
              <li>
                <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                  {t('nav.logout')}
                </button>
              </li>
            </>
          )}

          <li>
            <button className="lang-toggle" onClick={toggleLang}>
              {i18n.language === 'en' ? 'ع' : 'EN'}
            </button>
          </li>
        </ul>

        <button className="navbar__burger" onClick={() => setMenuOpen(v => !v)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
