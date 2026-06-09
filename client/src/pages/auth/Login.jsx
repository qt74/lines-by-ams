import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      if (user.role === 'admin')  navigate('/admin');
      else if (user.role === 'agency') navigate('/agency/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-card__logo">Fashion Mission</Link>
        <h1 className="auth-card__title">{t('auth.loginTitle')}</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>{t('auth.email')}
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))} />
          </label>
          <label>{t('auth.password')}
            <input type="password" required value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))} />
          </label>
          <button className="btn btn--solid btn--full" disabled={loading}>
            {loading ? t('common.loading') : t('auth.loginBtn')}
          </button>
        </form>

        <p className="auth-card__switch">
          {t('auth.noAccount')} <Link to="/register">{t('nav.register')}</Link>
        </p>
      </div>
    </main>
  );
}
