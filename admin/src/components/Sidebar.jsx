import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/',         icon: '📊', label: 'Overview'  },
  { path: '/shops',    icon: '🏪', label: 'Shops'     },
  { path: '/products', icon: '📦', label: 'Products'  },
  { path: '/users',    icon: '👤', label: 'Users'     },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <h1>Lines By AMS</h1>
        <p>Admin Panel</p>
      </div>

      <nav className="sidebar__nav">
        {NAV.map(({ path, icon, label }) => (
          <button
            key={path}
            className={`sidebar__link ${pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <span className="icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <strong>{admin?.name}</strong>
        {admin?.email}
        <button
          onClick={logout}
          style={{ display:'block', marginTop:'.6rem', color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontSize:'.78rem', padding:0 }}
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
