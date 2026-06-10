import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import TalentCard from '../../components/ui/TalentCard';

const SKILL_CHIPS = [
  { label: 'Model',           emoji: '👗' },
  { label: 'Stylist',         emoji: '✂️' },
  { label: 'Photographer',    emoji: '📸' },
  { label: 'Makeup Artist',   emoji: '💄' },
  { label: 'Fashion Designer',emoji: '🎨' },
  { label: 'Boutique Owner',  emoji: '🏪' },
  { label: 'Retail Buyer',    emoji: '🛍️' },
  { label: 'Brand Ambassador',emoji: '⭐' },
];

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [stats,    setStats]    = useState({ talent: 0, agencies: 0, placements: 0 });

  useEffect(() => {
    // Load featured talent
    api.get('/talent?limit=6').then(r => {
      setFeatured(r.data.talent || []);
      setStats(s => ({ ...s, talent: r.data.total || 0 }));
    }).catch(() => {});

    // Load agencies count
    api.get('/agencies').then(r => {
      setStats(s => ({ ...s, agencies: (r.data.agencies || []).length }));
    }).catch(() => {});
  }, []);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__overlay" />
        <div className="container hero__content">
          <p className="hero__eyebrow">Qatar · Fashion · Talent</p>
          <h1 className="hero__title">{t('home.heroTitle')}</h1>
          <p className="hero__sub">{t('home.heroSub')}</p>
          <div className="hero__actions">
            <Link to="/browse" className="btn btn--solid btn--lg">{t('home.heroCta')}</Link>
            <Link to="/register" className="btn btn--outline-white btn--lg">Join as Agency</Link>
          </div>
        </div>
      </section>

      {/* ── PLATFORM STATS ───────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container stats-bar__inner">
          <div className="stats-bar__item">
            <span className="stats-bar__num">{stats.talent > 0 ? stats.talent : '100+'}</span>
            <span className="stats-bar__label">Fashion Professionals</span>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <span className="stats-bar__num">{stats.agencies > 0 ? stats.agencies : '20+'}</span>
            <span className="stats-bar__label">Verified Agencies</span>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <span className="stats-bar__num">Qatar</span>
            <span className="stats-bar__label">Based &amp; GCC-wide</span>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <span className="stats-bar__num">QAR</span>
            <span className="stats-bar__label">Transparent Pricing</span>
          </div>
        </div>
      </section>

      {/* ── SKILL QUICK-FILTERS ──────────────────────────────── */}
      <section className="skills-bar">
        <div className="container skills-bar__inner">
          {SKILL_CHIPS.map(({ label, emoji }) => (
            <Link
              key={label}
              to={`/browse?skill=${encodeURIComponent(label)}`}
              className="skill-chip"
            >
              <span className="skill-chip__emoji">{emoji}</span>
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED TALENT ──────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">{t('home.featuredTitle')}</h2>
            <Link to="/browse" className="btn btn--ghost btn--sm">View all →</Link>
          </div>
          {featured.length > 0 ? (
            <div className="talent-grid">
              {featured.map(tl => <TalentCard key={tl._id} talent={tl} />)}
            </div>
          ) : (
            <div className="home-empty-state">
              <p>New talent listings coming soon — <Link to="/register">register your agency</Link> to be first.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <h2 className="section__title">{t('home.howTitle')}</h2>
          <div className="steps-grid">
            {[
              { n:1, icon:'🏢', title: t('home.step1Title'), desc: t('home.step1Desc') },
              { n:2, icon:'👤', title: t('home.step2Title'), desc: t('home.step2Desc') },
              { n:3, icon:'🔍', title: t('home.step3Title'), desc: t('home.step3Desc') },
              { n:4, icon:'🤝', title: t('home.step4Title'), desc: t('home.step4Desc') },
            ].map(({ n, icon, title, desc }) => (
              <div className="step-card" key={n}>
                <div className="step-card__icon">{icon}</div>
                <div className="step-card__num">0{n}</div>
                <h3 className="step-card__title">{title}</h3>
                <p className="step-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY LINES BY AMS ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="section__title">Why Lines By AMS?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">✅</div>
              <h3>Verified Agencies</h3>
              <p>Every agency is manually reviewed and approved before listing talent on the platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">🇶🇦</div>
              <h3>Qatar-First</h3>
              <p>Built for the GCC market with Arabic language support, QAR pricing, and local expertise.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">💳</div>
              <h3>Secure Payments</h3>
              <p>Stripe-powered payments with transparent pricing. No hidden fees.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">📋</div>
              <h3>Full Contract Management</h3>
              <p>From browse to hire — manage the entire process on one platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <h2>Are you a fashion agency or boutique?</h2>
          <p>List your talent, manage hirings, and grow your business on Lines By AMS.</p>
          <div className="cta-banner__actions">
            <Link to="/register" className="btn btn--solid btn--lg">Register Your Agency</Link>
            <Link to="/browse" className="btn btn--outline-white btn--lg">Browse Talent</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
