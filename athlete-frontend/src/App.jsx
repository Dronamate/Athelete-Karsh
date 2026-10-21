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

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        
          {/* Dashboard Routes */}
          <Route path="/athlete" element={<AthleteDashboard />} />
          <Route path="/professional" element={<ProfessionalPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/performance" element={<PerformanceAnalysis />} />
          
          {/* Account Route */}
          <Route path="/profile" element={<Profile />} />
          
          {/* 404 Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
