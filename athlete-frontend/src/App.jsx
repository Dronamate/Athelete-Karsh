// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AthleteDashboard from './pages/AthleteDashboard';
import ProfessionalPortal from './pages/ProfessionalPortal';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';

// Dynamic Page Metadata Map
const ROUTE_META = {
  '/': {
    title: 'DronaMate | Your Training Partner - Elite Coach & Trainer Booking',
    description:
      'Connect and train with certified ICC, BCCI, and elite coaches and trainers across Cricket, Fitness, Physiotherapy, Sports Nutrition, and Yoga across India.',
  },
  '/login': {
    title: 'Log In | DronaMate High-Performance Portal',
    description:
      'Sign in with your email or mobile number to access your DronaMate training schedule, sessions, and bookings.',
  },
  '/register': {
    title: 'Join DronaMate | Athlete & Coach Registration',
    description:
      'Create your athlete profile or apply as a certified coach on DronaMate. Start 1-on-1 and group athletic training.',
  },
  '/register/athlete': {
    title: 'Athlete Intake & Registration | DronaMate',
    description:
      'Register as an athlete to book personalized 1-on-1 and group coaching sessions with certified sports trainers across India.',
  },
  '/register/coach': {
    title: 'Apply as a Coach / Trainer | DronaMate',
    description:
      'Apply to join the certified sports technical roster on DronaMate. Publish slots, manage bookings, and train dedicated athletes.',
  },
  '/athlete': {
    title: 'Athlete Booking Hub | DronaMate',
    description:
      'Browse verified trainers, inspect real-time slot availability, and manage your scheduled sessions.',
  },
  '/professional': {
    title: 'Trainer Portal & Availability | DronaMate',
    description:
      'Manage your live training availability, publish session slots, and view athlete bookings in real time.',
  },
  '/admin': {
    title: 'Platform Control Center | DronaMate Admin',
    description:
      'Manage user accounts, verify coach credentials, monitor live availability, and audit platform security.',
  },
  '/chat': {
    title: 'Training Messages & Feedback | DronaMate',
    description:
      'Direct real-time messaging between athletes and certified trainers for session feedback and coordination.',
  },
  '/profile': {
    title: 'My Profile & Credentials | DronaMate',
    description:
      'Update your personal identity, athletic attributes, facility locations, and password settings.',
  },
};

function RouteMetadata() {
  const location = useLocation();

  useEffect(() => {
    const meta = ROUTE_META[location.pathname] || {
      title: '404 - Page Not Found | DronaMate',
      description: 'The requested page could not be found on DronaMate.',
    };

    document.title = meta.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', meta.description);
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  const isImpersonating = sessionStorage.getItem('is_impersonating') === 'true';
  const impersonatedUser = sessionStorage.getItem('user_name');
  const impersonatedRole = sessionStorage.getItem('user_role');

  const handleExitImpersonation = () => {
    const adminToken = sessionStorage.getItem('admin_backup_token');
    const adminRefresh = sessionStorage.getItem('admin_backup_refresh');
    const adminUser = sessionStorage.getItem('admin_backup_user');

    sessionStorage.clear();
    if (adminToken) sessionStorage.setItem('access_token', adminToken);
    if (adminRefresh) sessionStorage.setItem('refresh_token', adminRefresh);
    if (adminUser) sessionStorage.setItem('user_name', adminUser);
    sessionStorage.setItem('user_role', 'ADMIN');
    window.location.href = '/admin';
  };

  return (
    <ToastProvider>
      <RouteMetadata />
      <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] flex flex-col selection:bg-[#ff5500] selection:text-white overflow-x-hidden w-full max-w-[100vw]">
        {isImpersonating && (
          <div className="bg-amber-400 text-slate-950 px-4 py-2 font-bold text-xs flex flex-col sm:flex-row justify-between items-center shadow-lg sticky top-0 z-[100] border-b border-amber-500">
            <div className="flex items-center gap-2 mb-1 sm:mb-0">
              <span className="text-sm">⚠️</span>
              <span>
                <strong>TROUBLESHOOTING MODE:</strong> Viewing platform as <u>@{impersonatedUser}</u> ({impersonatedRole}). Any changes made affect this user account.
              </span>
            </div>
            <button
              onClick={handleExitImpersonation}
              className="bg-slate-900 hover:bg-black text-white px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm"
            >
              Exit Impersonation &amp; Return to Admin
            </button>
          </div>
        )}
        <Navbar />

        <main className="flex-1 overflow-x-hidden w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/athlete" element={<Register initialRole="ATHLETE" />} />
            <Route path="/register/coach" element={<Register initialRole="COACH" />} />

            <Route
              path="/athlete"
              element={
                <ProtectedRoute allowedRoles={['ATHLETE']}>
                  <AthleteDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/professional"
              element={
                <ProtectedRoute allowedRoles={['PROFESSIONAL']}>
                  <ProfessionalPortal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['ATHLETE', 'PROFESSIONAL', 'ADMIN']}>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['ATHLETE', 'PROFESSIONAL', 'ADMIN']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </ToastProvider>
  );
}
