import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  const values = [
    { icon: '🤝', titleKey: 'about.val1Title', descKey: 'about.val1Desc' },
    { icon: '✨', titleKey: 'about.val2Title', descKey: 'about.val2Desc' },
    { icon: '🔓', titleKey: 'about.val3Title', descKey: 'about.val3Desc' },
    { icon: '🛡️', titleKey: 'about.val4Title', descKey: 'about.val4Desc' },
  ];

  return (
    <main className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero__overlay" />
        <div className="container about-hero__content">
          <p className="about-hero__eyebrow">{t('about.eyebrow')}</p>
          <h1 className="about-hero__title">{t('about.title')}</h1>
          <p className="about-hero__sub">{t('about.subtitle')}</p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="about-story section">
        <div className="container about-story__inner">
          <div className="about-story__img">
            <div className="about-story__img-inner">
              <span className="about-story__monogram">
                <span>L</span><span>A</span>
              </span>
              <div className="about-story__flag">🇶🇦</div>
            </div>
          </div>
          <div className="about-story__text">
            <span className="about-eyebrow">— {t('about.title')}</span>
            <h2 className="about-section-title">{t('about.subtitle')}</h2>
            <p>{t('about.story1')}</p>
            <p>{t('about.story2')}</p>
            <p>{t('about.story3')}</p>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="about-mission">
        <div className="container about-mission__inner">
          <span className="about-eyebrow">— {t('about.missionTitle')}</span>
          <blockquote className="about-mission__quote">
            "{t('about.mission')}"
          </blockquote>
          <p className="about-mission__attr">Lines By AMS · Doha, Qatar 🇶🇦</p>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="section">
        <div className="container">
          <div className="about-values-header">
            <span className="about-eyebrow">— What We Stand For</span>
          </div>
          <div className="about-values-grid">
            {values.map(({ icon, titleKey, descKey }, i) => (
              <div className="about-value-card" key={i}>
                <div className="about-value-card__num">0{i + 1}</div>
                <div className="about-value-card__icon">{icon}</div>
                <h3>{t(titleKey)}</h3>
                <p>{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="stats-bar">
        <div className="container stats-bar__inner">
          <div className="stats-bar__item">
            <span className="stats-bar__num">2024</span>
            <span className="stats-bar__label">Founded in Doha</span>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <span className="stats-bar__num">100%</span>
            <span className="stats-bar__label">Qatari-Made</span>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <span className="stats-bar__num">GCC</span>
            <span className="stats-bar__label">Reach</span>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <span className="stats-bar__num">Free</span>
            <span className="stats-bar__label">Always Free to List</span>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <h2>{t('about.ctaTitle')}</h2>
          <p>{t('about.ctaSub')}</p>
          <div className="cta-banner__actions">
            <Link to="/shop/dashboard" className="btn btn--solid btn--lg">{t('about.ctaBtn1')}</Link>
            <Link to="/shops"          className="btn btn--outline-white btn--lg">{t('about.ctaBtn2')}</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
