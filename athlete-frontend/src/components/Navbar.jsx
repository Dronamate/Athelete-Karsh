import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');
  const username = sessionStorage.getItem('user_name') || '';

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Global ⌘K / Ctrl+K listener to trigger search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        triggerSearchFocus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (role === 'ATHLETE') return '/athlete';
    if (role === 'PROFESSIONAL') return '/professional';
    if (role === 'ADMIN') return '/admin';
    return '/';
  };

  const scrollToSection = (hash) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/' + hash);
    }
  };

  const triggerSearchFocus = () => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      const searchInput = document.querySelector('input[placeholder*="Jasprit"], input[placeholder*="Search by trainer"]');
      if (searchInput) {
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => searchInput.focus(), 300);
      } else {
        scrollToSection('#coaches');
      }
    } else {
      navigate('/#coaches');
    }
  };

  return (
    <>
      {/* Top Telemetry Strip */}
      <div className="bg-[#0c2340] text-slate-300 text-[10px] sm:text-[11px] font-sans border-b border-[#1b3558] py-1.5 px-4 sm:px-6 lg:px-8 flex justify-between items-center select-none overflow-x-hidden w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-bold text-emerald-400 tracking-wider uppercase truncate">
            System Telemetry Online
          </span>
          <span className="hidden md:inline text-slate-400 truncate">
            • Live Athlete-Coach Synchronization Hub
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-slate-400">
          <span className="hidden sm:inline">
            PITCH NETWORK: <strong className="text-white font-mono">1,420 ONLINE</strong>
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span>
            STAFF: <strong className="text-emerald-400 font-mono">98.4% CERTIFIED</strong>
          </span>
        </div>
      </div>

      {/* Main High-Contrast Navbar */}
      <nav className="bg-white/95 backdrop-blur-md text-[#0c2340] shadow-sm sticky top-0 z-50 border-b border-slate-200 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">

            {/* Left: Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={token ? getDashboardLink() : "/"}
                className="group flex items-center py-1 focus:outline-none shrink-0"
                title="DronaMate Home"
              >
                <BrandLogo size="md" />
              </Link>
            </div>

            {/* Middle: Desktop Navigation Links (strictly 1 line, no wrapping) */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-6 shrink-0">
              <button
                type="button"
                onClick={() => scrollToSection('#coaches')}
                className="text-[#0c2340] hover:text-[#ff5500] font-sans font-semibold text-xs xl:text-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                Browse Trainers
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('#categories')}
                className="text-[#0c2340] hover:text-[#ff5500] font-sans font-semibold text-xs xl:text-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                Categories
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('#blueprint')}
                className="text-[#0c2340] hover:text-[#ff5500] font-sans font-semibold text-xs xl:text-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                Performance Blueprint
              </button>
              <Link
                to="/register/coach"
                className="text-[#0c2340] hover:text-[#ff5500] font-sans font-semibold text-xs xl:text-sm transition-colors whitespace-nowrap"
              >
                Apply as Coach/Trainer
              </Link>
            </div>

            {/* Right: Quick Search, Role Badge & CTA (strictly 1 line, no wrapping) */}
            <div className="hidden md:flex items-center gap-2 xl:gap-3 shrink-0">
              {/* Quick Search Trigger */}
              <button
                type="button"
                onClick={triggerSearchFocus}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition cursor-pointer whitespace-nowrap shrink-0"
                title="Quick Search Trainers (⌘K)"
              >
                <span className="text-slate-400">🔍</span>
                <span className="hidden xl:inline">Find trainers...</span>
                <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-500 font-mono shadow-xs">⌘K</kbd>
              </button>

              {/* Mode Badge */}
              <span className="inline-flex items-center gap-1.5 bg-[#0c2340]/5 border border-[#0c2340]/10 text-[#0c2340] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-display whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {role === 'PROFESSIONAL' ? 'Coach Mode' : role === 'ADMIN' ? 'Admin Mode' : 'Athlete Mode'}
              </span>

              {!token ? (
                <>
                  <div className="h-5 w-px bg-slate-200 mx-0.5 xl:mx-1"></div>
                  <Link
                    to="/login"
                    className="text-[#0c2340] hover:text-[#ff5500] font-sans font-bold text-xs xl:text-sm px-2 py-1.5 transition font-display whitespace-nowrap shrink-0"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#ff5500] hover:bg-[#ea4c00] text-white px-3.5 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-bold font-sans transition-all duration-150 shadow-sm shadow-[#ff5500]/25 active:scale-95 font-display whitespace-nowrap shrink-0"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <div className="h-5 w-px bg-slate-200 mx-0.5 xl:mx-1"></div>
                  <Link
                    to={getDashboardLink()}
                    className="bg-slate-100 hover:bg-slate-200 text-[#0c2340] font-sans font-bold text-xs px-3 py-1.5 rounded-lg transition border border-slate-200 font-display whitespace-nowrap shrink-0"
                  >
                    {role === 'PROFESSIONAL' ? 'Coach Portal' : role === 'ADMIN' ? 'Control Center' : 'My Bookings'}
                  </Link>
                  <Link
                    to="/chat"
                    className="text-[#0c2340] hover:text-[#ff5500] font-sans font-bold text-xs px-2 transition font-display whitespace-nowrap shrink-0"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/profile"
                    className="text-[#0c2340] hover:text-[#ff5500] font-sans font-bold text-xs px-2 transition font-display"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="bg-[#0c2340] hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition shadow-xs font-display"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={triggerSearchFocus}
                className="p-2 text-slate-600 hover:text-[#ff5500]"
                aria-label="Search"
              >
                🔍
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#0c2340] hover:text-[#ff5500] p-2 rounded-lg focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-xl px-5 pt-3 pb-6 space-y-3 animate-fadeIn">
            {/* Quick Status Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[#0c2340] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {role === 'PROFESSIONAL' ? 'Coach Mode' : role === 'ADMIN' ? 'Admin Mode' : 'Athlete Mode'}
              </span>
              <a
                href="tel:+918219486269"
                className="text-[#ff5500] font-bold flex items-center gap-1"
              >
                📞 +91 8219486269
              </a>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => scrollToSection('#coaches')}
                className="text-left w-full px-3 py-2.5 text-[#0c2340] hover:text-[#ff5500] hover:bg-slate-50 rounded-lg font-bold text-sm flex items-center justify-between"
              >
                <span>Browse Trainers</span>
                <span className="text-slate-400">→</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('#categories')}
                className="text-left w-full px-3 py-2.5 text-[#0c2340] hover:text-[#ff5500] hover:bg-slate-50 rounded-lg font-bold text-sm flex items-center justify-between"
              >
                <span>Disciplines &amp; Categories</span>
                <span className="text-slate-400">→</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('#blueprint')}
                className="text-left w-full px-3 py-2.5 text-[#0c2340] hover:text-[#ff5500] hover:bg-slate-50 rounded-lg font-bold text-sm flex items-center justify-between"
              >
                <span>Performance Blueprint</span>
                <span className="text-slate-400">→</span>
              </button>
              <Link
                to="/register/coach"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full px-3 py-2.5 text-[#0c2340] hover:text-[#ff5500] hover:bg-slate-50 rounded-lg font-bold text-sm"
              >
                Apply as Coach/Trainer
              </Link>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2">
              {!token ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2.5 text-[#0c2340] hover:bg-slate-100 rounded-lg font-bold text-sm border border-slate-200 font-display min-h-[44px] flex items-center justify-center"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-[#ff5500] hover:bg-[#ea4c00] text-white rounded-lg font-bold text-sm shadow-md font-display min-h-[44px] flex items-center justify-center"
                  >
                    Get Started (Start Training)
                  </Link>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-[#0c2340] hover:bg-slate-50 rounded-lg font-bold text-sm"
                  >
                    {role === 'PROFESSIONAL' ? '📊 Coach Portal' : role === 'ADMIN' ? '🛡️ Control Center' : '📅 My Bookings'}
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-[#0c2340] hover:bg-slate-50 rounded-lg font-bold text-sm"
                  >
                    💬 Messages
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-[#0c2340] hover:bg-slate-50 rounded-lg font-bold text-sm"
                  >
                    👤 My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-bold text-sm min-h-[44px]"
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Contact Quick Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <a href="mailto:info@dronamate.in" className="hover:text-[#ff5500]">
                ✉️ info@dronamate.in
              </a>
              <a href="tel:+918219486269" className="hover:text-[#ff5500]">
                📞 8219486269
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
