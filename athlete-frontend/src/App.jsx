// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AthleteDashboard from './pages/AthleteDashboard';
import ProfessionalPortal from './pages/ProfessionalPortal';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import PerformanceAnalysis from './pages/PerformanceAnalysis';
import NotFound from './pages/NotFound';

// Component Imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

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
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-orange-500 selection:text-white">
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
            Exit Impersonation & Return to Admin
          </button>
        </div>
      )}
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        
          {/* Athlete Routes (RBAC: ATHLETE only) */}
          <Route 
            path="/athlete" 
            element={
              <ProtectedRoute allowedRoles={['ATHLETE']}>
                <AthleteDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/performance" 
            element={
              <ProtectedRoute allowedRoles={['ATHLETE']}>
                <PerformanceAnalysis />
              </ProtectedRoute>
            } 
          />
          
          {/* Coach Routes (RBAC: PROFESSIONAL only) */}
          <Route 
            path="/professional" 
            element={
              <ProtectedRoute allowedRoles={['PROFESSIONAL']}>
                <ProfessionalPortal />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes (RBAC: ADMIN only) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared Authenticated Routes */}
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
          
          {/* 404 Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
