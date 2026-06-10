import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location]);

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('fm_lang', next);
    document.documentElement.dir  = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const dashPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin')  return '/admin';
    if (user.role === 'agency') return '/agency/dashboard';
    return '/dashboard';
  };

  const profilePath = () => {
    if (!user) return '/login';
    if (user.role === 'agency') return '/agency/profile';
    return '/profile';
  };

  return (
    <nav className="navbar">
      <div className="container navbar__inner">

        {/* ── Logo ── */}
        <Link to="/" className="navbar__logo">Lines By AMS</Link>

        {/* ── Centre links ── */}
        <ul className={`navbar__links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/">{t('nav.home')}</Link></li>
          <li><Link to="/shops">{t('nav.shops')}</Link></li>
          <li><Link to="/browse">{t('nav.browse')}</Link></li>
          <li><Link to="/about">{t('nav.about')}</Link></li>
        </ul>

        {/* ── Right actions ── */}
        <div className="navbar__actions">
          {/* Language toggle */}
          <button className="lang-toggle" onClick={toggleLang} title="Switch language">
            {i18n.language === 'en' ? 'ع' : 'EN'}
          </button>

          {!user ? (
            <>
              <Link to="/login"          className="btn btn--ghost btn--sm">{t('nav.login')}</Link>
              <Link to="/shop/dashboard" className="btn btn--solid btn--sm">{t('nav.openShop')}</Link>
            </>
          ) : (
            <div className="nav-user" ref={dropRef}>
              <button
                className="nav-user__btn"
                onClick={() => setDropOpen(v => !v)}
                aria-label="User menu"
              >
                <span className="nav-user__avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <svg className="nav-user__caret" viewBox="0 0 10 6" fill="currentColor">
                  <path d="M0 0l5 6 5-6z"/>
                </svg>
              </button>

              {dropOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown__header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link to={dashPath()}>Dashboard</Link>
                  {(user.role === 'customer' || user.role === 'agency') && (
                    <Link to="/messages">Messages</Link>
                  )}
                  {user.role !== 'admin' && (
                    <>
                      <Link to={profilePath()}>My Profile</Link>
                      <Link to="/shop/dashboard">My Shop</Link>
                    </>
                  )}
                  <hr />
                  <button onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className={`navbar__burger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
