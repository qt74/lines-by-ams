import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AVAILABILITY_COLOR = {
  Available:   '#22c55e',
  Booked:      '#f59e0b',
  Unavailable: '#ef4444',
};

export default function TalentCard({ talent }) {
  const { t, i18n } = useTranslation();
  const name = (i18n.language === 'ar' && talent.nameAr) ? talent.nameAr : talent.name;
  const isPremium = talent.agency?.isPremium === true;

  return (
    <div className={`talent-card${isPremium ? ' talent-card--premium' : ''}`}>
      <div className="talent-card__img-wrap">
        <img
          src={talent.photo || 'https://images.unsplash.com/photo-1618407960998-7864dd928574?auto=format&fit=crop&w=600&q=80'}
          alt={name}
          className="talent-card__img"
        />
        <span
          className="talent-card__availability"
          style={{ background: AVAILABILITY_COLOR[talent.availability] }}
        >
          {t(`talent.${talent.availability.toLowerCase()}`)}
        </span>
        {isPremium && (
          <span className="talent-card__premium-badge">★ Featured</span>
        )}
      </div>
      <div className="talent-card__body">
        <h3 className="talent-card__name">{name}</h3>
        <p className="talent-card__agency">
          {talent.agency?.agencyName}
          {isPremium && <span className="premium-dot" title="Premium Agency" />}
        </p>
        {talent.experience > 0 && (
          <p className="talent-card__exp">
            {t('talent.experience', { n: talent.experience })}
          </p>
        )}
        <div className="talent-card__skills">
          {talent.skills?.slice(0, 3).map(s => (
            <span key={s} className="skill-tag">{s}</span>
          ))}
        </div>
        <div className="talent-card__footer">
          <span className="talent-card__salary">
            {talent.salaryRange?.min?.toLocaleString()} – {talent.salaryRange?.max?.toLocaleString()} QAR
          </span>
          <Link to={`/talent/${talent._id}`} className="btn btn--solid btn--sm">
            {t('talent.viewProfile')}
          </Link>
        </div>
      </div>
    </div>
  );
}
