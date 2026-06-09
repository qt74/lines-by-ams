import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { t }            = useTranslation();
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    location: user?.location || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/me', form);
      setUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="profile-page">
      <div className="container container--narrow">
        <div className="profile-card">
          <div className="profile-card__header">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="profile-card__name">{user?.name}</h1>
              <p className="profile-card__email">{user?.email}</p>
              <span className="badge badge--blue">Employer</span>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <h2>Edit Profile</h2>

            <div className="form-group">
              <label htmlFor="name">{t('auth.name')}</label>
              <input
                id="name" name="name" type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t('auth.phone')}</label>
              <input
                id="phone" name="phone" type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+974 XXXX XXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">{t('auth.location')}</label>
              <input
                id="location" name="location" type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Doha, Qatar"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--solid" disabled={saving}>
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
