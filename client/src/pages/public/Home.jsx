import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import TalentCard from '../../components/ui/TalentCard';

const SKILLS = ['Model','Stylist','Photographer','Makeup Artist','Fashion Designer','Seamstress / Tailor'];

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/talent?limit=6').then(r => setFeatured(r.data.talent)).catch(() => {});
  }, []);

  return (
    <main>
      {/* HERO */}
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

      {/* SKILL CHIPS */}
      <section className="skills-bar">
        <div className="container skills-bar__inner">
          {SKILLS.map(s => (
            <Link key={s} to={`/browse?skill=${encodeURIComponent(s)}`} className="skill-chip">{s}</Link>
          ))}
        </div>
      </section>

      {/* FEATURED TALENT */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section__title">{t('home.featuredTitle')}</h2>
            <div className="talent-grid">
              {featured.map(t => <TalentCard key={t._id} talent={t} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/browse" className="btn btn--outline">{t('nav.browse')} →</Link>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="section section--alt">
        <div className="container">
          <h2 className="section__title">{t('home.howTitle')}</h2>
          <div className="steps-grid">
            {[1,2,3,4].map(n => (
              <div className="step-card" key={n}>
                <div className="step-card__num">0{n}</div>
                <h3 className="step-card__title">{t(`home.step${n}Title`)}</h3>
                <p className="step-card__desc">{t(`home.step${n}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <h2>Are you a fashion agency?</h2>
          <p>List your talent, manage hirings, and grow your business on Lines By AMS.</p>
          <Link to="/register" className="btn btn--solid btn--lg">Register Your Agency</Link>
        </div>
      </section>
    </main>
  );
}
