import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">Lines By AMS</div>
        <div className="login-card__sub">Admin Panel — Authorised access only</div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={submit}>
          <label>Email address</label>
          <input
            type="email" value={email} required autoFocus
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@linesbyams.qa"
          />
          <label>Password</label>
          <input
            type="password" value={password} required
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button className="btn btn--primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}
