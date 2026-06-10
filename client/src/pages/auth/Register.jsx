import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', location: '',
    role: 'customer', agencyName: '', description: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      if (user.role === 'agency') {
        toast('Your agency is pending admin approval.', { icon: '⏳' });
        navigate('/agency/dashboard');
      } else {
        navigate('/browse');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-card auth-card--wide">
        <Link to="/" className="auth-card__logo">Lines By AMS</Link>
        <h1 className="auth-card__title">{t('auth.registerTitle')}</h1>

        {/* ROLE SELECTOR */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${form.role === 'customer' ? 'active' : ''}`}
            onClick={() => set('role', 'customer')}
          >
            👤 {t('auth.roleCustomer')}
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'agency' ? 'active' : ''}`}
            onClick={() => set('role', 'agency')}
          >
            🏢 {t('auth.roleAgency')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__row">
            <label>{t('auth.name')}
              <input type="text" required value={form.name}
                onChange={e => set('name', e.target.value)} />
            </label>
            <label>{t('auth.email')}
              <input type="email" required value={form.email}
                onChange={e => set('email', e.target.value)} />
            </label>
          </div>
          <div className="auth-form__row">
            <label>{t('auth.password')}
              <input type="password" required minLength={6} value={form.password}
                onChange={e => set('password', e.target.value)} />
            </label>
            <label>{t('auth.phone')}
              <input type="tel" value={form.phone}
                onChange={e => set('phone', e.target.value)} />
            </label>
          </div>
          <label>{t('auth.location')}
            <input type="text" placeholder="e.g. Doha, Qatar" value={form.location}
              onChange={e => set('location', e.target.value)} />
          </label>

          {form.role === 'agency' && (
            <>
              <label>{t('auth.agencyName')} *
                <input type="text" required value={form.agencyName}
                  onChange={e => set('agencyName', e.target.value)} />
              </label>
              <label>{t('auth.agencyDesc')}
                <textarea rows={3} value={form.description}
                  onChange={e => set('description', e.target.value)} />
              </label>
            </>
          )}

          <button className="btn btn--solid btn--full" disabled={loading}>
            {loading ? t('common.loading') : t('auth.registerBtn')}
          </button>
        </form>

        <p className="auth-card__switch">
          {t('auth.hasAccount')} <Link to="/login">{t('nav.login')}</Link>
        </p>
      </div>
    </main>
  );
}
