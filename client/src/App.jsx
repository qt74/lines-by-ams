import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { lazy, Suspense } from 'react';
import './i18n';
import './index.css';

import Navbar         from './components/layout/Navbar';
import Footer         from './components/layout/Footer';
import ProtectedRoute from './components/ui/ProtectedRoute';

// Eagerly loaded (critical path)
import Home               from './pages/public/Home';
import Browse             from './pages/public/Browse';
import Login              from './pages/auth/Login';
import Register           from './pages/auth/Register';
import CustomerDashboard  from './pages/customer/CustomerDashboard';
import AgencyDashboard    from './pages/agency/AgencyDashboard';
import TalentForm         from './pages/agency/TalentForm';

// Lazily loaded
const TalentDetail      = lazy(() => import('./pages/public/TalentDetail'));
const EmploymentDetail  = lazy(() => import('./pages/customer/EmploymentDetail'));
const CustomerProfile   = lazy(() => import('./pages/customer/CustomerProfile'));
const AgencyEmployment  = lazy(() => import('./pages/agency/AgencyEmployment'));
const AgencyProfile     = lazy(() => import('./pages/agency/AgencyProfile'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="loading-screen">Loading...</div>}>
        {children}
      </Suspense>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          {/* PUBLIC */}
          <Route path="/"           element={<Layout><Home /></Layout>} />
          <Route path="/browse"     element={<Layout><Browse /></Layout>} />
          <Route path="/talent/:id" element={<Layout><TalentDetail /></Layout>} />

          {/* AUTH */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* CUSTOMER */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['customer']}>
              <Layout><CustomerDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employment/:id" element={
            <ProtectedRoute roles={['customer']}>
              <Layout><EmploymentDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute roles={['customer']}>
              <Layout><CustomerProfile /></Layout>
            </ProtectedRoute>
          } />

          {/* AGENCY */}
          <Route path="/agency/dashboard" element={
            <ProtectedRoute roles={['agency']}>
              <Layout><AgencyDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/agency/talent/new" element={
            <ProtectedRoute roles={['agency']}>
              <Layout><TalentForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/agency/talent/:id/edit" element={
            <ProtectedRoute roles={['agency']}>
              <Layout><TalentForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/agency/employment/:id" element={
            <ProtectedRoute roles={['agency']}>
              <Layout><AgencyEmployment /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/agency/profile" element={
            <ProtectedRoute roles={['agency']}>
              <Layout><AgencyProfile /></Layout>
            </ProtectedRoute>
          } />

          {/* ADMIN */}
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
                <h1>404 — Page Not Found</h1>
              </div>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
