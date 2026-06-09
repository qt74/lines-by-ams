import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import TalentCard from '../../components/ui/TalentCard';

const SKILLS = [
  'Model','Stylist','Photographer','Videographer','Makeup Artist',
  'Hair Stylist','Fashion Designer','Seamstress / Tailor',
  'Textile Artist','Wardrobe Manager','Brand Ambassador',
  'Social Media Influencer','Art Director','Fashion Illustrator','Pattern Maker',
];
const CONTRACTS     = ['Yearly','Monthly','Hourly'];
const AVAILABILITY  = ['Available','Booked','Unavailable'];

export default function Browse() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [talent,   setTalent]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);

  const [filters, setFilters] = useState({
    search:       searchParams.get('search')       || '',
    skill:        searchParams.get('skill')        || '',
    contract:     searchParams.get('contract')     || '',
    availability: searchParams.get('availability') || '',
    minSalary:    searchParams.get('minSalary')    || '',
    maxSalary:    searchParams.get('maxSalary')    || '',
  });

  const fetchTalent = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/talent', { params });
      setTalent(res.data.talent);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {}
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchTalent(); }, [fetchTalent]);

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search:'', skill:'', contract:'', availability:'', minSalary:'', maxSalary:'' });
    setPage(1);
  };

  return (
    <main className="browse-page">
      <div className="container">
        <div className="browse-page__header">
          <h1>Browse Fashion Talent</h1>
          <p>{total} talent profiles available</p>
        </div>

        <div className="browse-page__layout">
          {/* SIDEBAR FILTERS */}
          <aside className="filters-sidebar">
            <div className="filters-sidebar__header">
              <h3>Filters</h3>
              <button className="btn btn--ghost btn--sm" onClick={clearFilters}>Clear all</button>
            </div>

            <div className="filter-group">
              <input
                className="filter-input"
                type="text"
                placeholder={t('talent.searchPlaceholder')}
                value={filters.search}
                onChange={e => handleFilter('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>{t('talent.filterSkill')}</label>
              <select value={filters.skill} onChange={e => handleFilter('skill', e.target.value)}>
                <option value="">All Skills</option>
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>{t('talent.filterContract')}</label>
              <select value={filters.contract} onChange={e => handleFilter('contract', e.target.value)}>
                <option value="">All Contracts</option>
                {CONTRACTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>{t('talent.filterAvailability')}</label>
              <select value={filters.availability} onChange={e => handleFilter('availability', e.target.value)}>
                <option value="">All</option>
                {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>{t('talent.filterSalary')} (QAR)</label>
              <div className="salary-range">
                <input type="number" placeholder="Min" value={filters.minSalary}
                  onChange={e => handleFilter('minSalary', e.target.value)} />
                <input type="number" placeholder="Max" value={filters.maxSalary}
                  onChange={e => handleFilter('maxSalary', e.target.value)} />
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <div className="browse-page__results">
            {loading ? (
              <div className="loading-grid">
                {[...Array(6)].map((_, i) => <div key={i} className="talent-card talent-card--skeleton" />)}
              </div>
            ) : talent.length === 0 ? (
              <div className="empty-state">
                <p>{t('common.noResults')}</p>
                <button className="btn btn--outline" onClick={clearFilters}>Clear filters</button>
              </div>
            ) : (
              <>
                <div className="talent-grid">
                  {talent.map(t => <TalentCard key={t._id} talent={t} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button className="btn btn--outline btn--sm" disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span>Page {page} of {pages}</span>
                    <button className="btn btn--outline btn--sm" disabled={page === pages}
                      onClick={() => setPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
