import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AgencyProfile() {
  const { t }             = useTranslation();
  const { user, setUser } = useAuth();

  const [agency,  setAgency]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [form, setForm] = useState({
    agencyName:  '',
    description: '',
    website:     '',
    instagram:   '',
    linkedin:    '',
    twitter:     '',
  });

  // Personal info section
  const [personalForm, setPersonalForm] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    location: user?.location || '',
  });
  const [savingPersonal, setSavingPersonal] = useState(false);

  useEffect(() => {
    api.get('/agencies/profile')
      .then(r => {
        const a = r.data.agency;
        setAgency(a);
        setForm({
          agencyName:  a.agencyName  || '',
          description: a.description || '',
          website:     a.website     || '',
          instagram:   a.socialLinks?.instagram || '',
          linkedin:    a.socialLinks?.linkedin  || '',
          twitter:     a.socialLinks?.twitter   || '',
        });
      })
      .catch(() => toast.error('Failed to load agency profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('agencyName',  form.agencyName);
      fd.append('description', form.description);
      fd.append('website',     form.website);
      fd.append('socialLinks', JSON.stringify({
        instagram: form.instagram,
        linkedin:  form.linkedin,
        twitter:   form.twitter,
      }));
      if (logoFile) fd.append('logo', logoFile);

      const res = await api.put('/agencies/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAgency(res.data.agency);
      toast.success('Agency profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePersonalSubmit = async e => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      const res = await api.put('/auth/me', personalForm);
      setUser(res.data.user);
      toast.success('Personal info updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingPersonal(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  const logoSrc = logoPreview
    || (agency?.logo ? (agency.logo.startsWith('http') ? agency.logo : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${agency.logo}`) : null);

  return (
    <main className="profile-page">
      <div className="container container--narrow">

        {/* ── Agency Profile ─────────────────────────────────── */}
        <div className="profile-card">
          <div className="profile-card__header">
            <div className="agency-logo-wrap">
              {logoSrc
                ? <img src={logoSrc} alt="Agency logo" className="agency-logo" />
                : <div className="profile-avatar">{form.agencyName?.charAt(0).toUpperCase()}</div>
              }
              <label className="logo-upload-label" htmlFor="logo-input">
                Change Logo
                <input
                  id="logo-input" type="file" accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleLogoChange}
                />
              </label>
            </div>
            <div>
              <h1 className="profile-card__name">{form.agencyName || 'Your Agency'}</h1>
              <p className="profile-card__email">{user?.email}</p>
              {agency?.isApproved
                ? <span className="badge badge--green">Approved Agency</span>
                : <span className="badge badge--yellow">Pending Approval</span>
              }
              {agency?.isPremium && (
                <span className="badge badge--gold" style={{ marginLeft: '0.5rem' }}>Premium</span>
              )}
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <h2>Agency Information</h2>

            <div className="form-group">
              <label htmlFor="agencyName">Agency Name</label>
              <input
                id="agencyName" name="agencyName" type="text"
                value={form.agencyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description" name="description" rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Tell employers about your agency, specialities, and track record..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                id="website" name="website" type="url"
                value={form.website}
                onChange={handleChange}
                placeholder="https://youragency.com"
              />
            </div>

            <h3 style={{ marginTop: '1.5rem' }}>Social Links</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="instagram">Instagram</label>
                <input
                  id="instagram" name="instagram" type="url"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/youragency"
                />
              </div>
              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  id="linkedin" name="linkedin" type="url"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/youragency"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="twitter">Twitter / X</label>
              <input
                id="twitter" name="twitter" type="url"
                value={form.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/youragency"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--solid" disabled={saving}>
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </div>

        {/* ── Personal Info ──────────────────────────────────── */}
        <div className="profile-card" style={{ marginTop: '1.5rem' }}>
          <form className="profile-form" onSubmit={handlePersonalSubmit}>
            <h2>Personal Information</h2>

            <div className="form-group">
              <label htmlFor="p-name">{t('auth.name')}</label>
              <input
                id="p-name" name="name" type="text"
                value={personalForm.name}
                onChange={e => setPersonalForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="p-phone">{t('auth.phone')}</label>
                <input
                  id="p-phone" name="phone" type="tel"
                  value={personalForm.phone}
                  onChange={e => setPersonalForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+974 XXXX XXXX"
                />
              </div>
              <div className="form-group">
                <label htmlFor="p-location">{t('auth.location')}</label>
                <input
                  id="p-location" name="location" type="text"
                  value={personalForm.location}
                  onChange={e => setPersonalForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Doha, Qatar"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--solid" disabled={savingPersonal}>
                {savingPersonal ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </div>

        {/* ── Stats ─────────────────────────────────────────── */}
        {agency && (
          <div className="profile-card" style={{ marginTop: '1.5rem' }}>
            <h2>Agency Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card__value">{agency.totalPlacements ?? 0}</div>
                <div className="stat-card__label">{t('agency.totalPlacements')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value">{(agency.totalEarned ?? 0).toLocaleString()} QAR</div>
                <div className="stat-card__label">{t('agency.totalEarned')}</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
