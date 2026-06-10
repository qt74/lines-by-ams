import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar  from './components/Sidebar';
import Login    from './pages/Login';
import Overview from './pages/Overview';
import Shops    from './pages/Shops';
import Products from './pages/Products';
import Users    from './pages/Users';

function ProtectedLayout({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading…</div>;
  if (!admin)  return <Navigate to="/login" replace />;
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background:'#1a1d27', color:'#e8eaf0', border:'1px solid rgba(255,255,255,.1)' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedLayout><Overview /></ProtectedLayout>} />
          <Route path="/shops" element={<ProtectedLayout><Shops /></ProtectedLayout>} />
          <Route path="/products" element={<ProtectedLayout><Products /></ProtectedLayout>} />
          <Route path="/users" element={<ProtectedLayout><Users /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
