import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check auth state
  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');
  
  const handleLogout = () => {
    sessionStorage.clear();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  // Dynamically determine where the "Dashboard" button should go based on role
  const getDashboardLink = () => {
    if (role === 'ATHLETE') return '/athlete';
    if (role === 'PROFESSIONAL') return '/professional';
    if (role === 'ADMIN') return '/admin';
    return '/';
  };

  const scrollToSection = (hash) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/' + hash);
    }
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md text-white shadow-xl sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Side: Brand Logo & Academy Tag */}
          <div className="flex items-center gap-3">
            <Link 
              to={token ? getDashboardLink() : "/"} 
              className="flex items-center gap-2 transition hover:opacity-95 bg-white px-3 py-1.5 rounded-xl shadow-sm"
              title="DronaMate Home"
            >
              <img src="/logo.png" alt="DronaMate Logo" className="h-8 w-auto" />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              Cricket Academy
            </span>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Right Side: Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {!token ? (
              <>
                <button 
                  onClick={() => scrollToSection('#athletes')} 
                  className="text-slate-300 hover:text-orange-400 transition font-medium text-sm"
                >
                  For Athletes
                </button>
                <button 
                  onClick={() => scrollToSection('#coaches')} 
                  className="text-slate-300 hover:text-orange-400 transition font-medium text-sm"
                >
                  For Coaches
                </button>
                <button 
                  onClick={() => scrollToSection('#performance')} 
                  className="text-slate-300 hover:text-orange-400 transition font-medium text-sm"
                >
                  Performance
                </button>
                <button 
                  onClick={() => scrollToSection('#about')} 
                  className="text-slate-300 hover:text-orange-400 transition font-medium text-sm"
                >
                  About
                </button>
                <div className="h-6 w-px bg-slate-800 mx-2"></div>
                <Link to="/login" className="text-slate-300 hover:text-orange-400 transition font-semibold text-sm">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-orange-500 text-white hover:bg-orange-600 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md shadow-orange-500/20"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {/* 1. Athlete Navigation */}
                {role === 'ATHLETE' && (
                  <>
                    <Link to="/athlete" className="text-slate-300 hover:text-orange-400 transition font-semibold text-sm">
                      Dashboard
                    </Link>
                    <Link to="/performance" className="text-slate-300 hover:text-orange-400 transition font-semibold text-sm">
                      Batsman Card
                    </Link>
                  </>
                )}

                {/* 2. Coach / Professional Navigation */}
                {role === 'PROFESSIONAL' && (
                  <>
                    <Link to="/professional" className="text-slate-300 hover:text-orange-400 transition font-semibold text-sm">
                      Coach Portal
                    </Link>
                  </>
                )}

                {/* 3. Admin Navigation */}
                {role === 'ADMIN' && (
                  <>
                    <Link to="/admin" className="text-slate-300 hover:text-orange-400 transition font-semibold text-sm">
                      Control Center
                    </Link>
                  </>
                )}

                {/* Shared Navigation */}
                <Link to="/chat" className="text-slate-300 hover:text-orange-400 transition font-semibold text-sm">
                  Messages
                </Link>
                <Link to="/profile" className="text-slate-300 hover:text-orange-400 transition font-semibold text-sm">
                  {role === 'PROFESSIONAL' ? 'Coach Profile' : role === 'ADMIN' ? 'Admin Profile' : 'Account'}
                </Link>

                <button 
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 absolute w-full shadow-2xl z-50">
          <div className="px-4 pt-3 pb-6 space-y-1 flex flex-col">
            {!token ? (
              <>
                <button 
                  onClick={() => scrollToSection('#athletes')} 
                  className="text-left w-full px-4 py-3 text-slate-300 hover:text-orange-400 hover:bg-slate-800/80 rounded-xl font-medium min-h-[44px]"
                >
                  For Athletes
                </button>
                <button 
                  onClick={() => scrollToSection('#coaches')} 
                  className="text-left w-full px-4 py-3 text-slate-300 hover:text-orange-400 hover:bg-slate-800/80 rounded-xl font-medium min-h-[44px]"
                >
                  For Coaches
                </button>
                <button 
                  onClick={() => scrollToSection('#performance')} 
                  className="text-left w-full px-4 py-3 text-slate-300 hover:text-orange-400 hover:bg-slate-800/80 rounded-xl font-medium min-h-[44px]"
                >
                  Performance
                </button>
                <button 
                  onClick={() => scrollToSection('#about')} 
                  className="text-left w-full px-4 py-3 text-slate-300 hover:text-orange-400 hover:bg-slate-800/80 rounded-xl font-medium min-h-[44px]"
                >
                  About
                </button>
                <hr className="border-slate-800 my-2" />
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-4 py-3 text-slate-300 hover:text-orange-400 font-semibold min-h-[44px]"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-4 py-3 text-center bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold mt-2 shadow-md min-h-[44px] flex items-center justify-center"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {/* 1. Athlete Mobile Links */}
                {role === 'ATHLETE' && (
                  <>
                    <Link 
                      to="/athlete" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="block px-4 py-3 text-slate-300 hover:text-orange-400 rounded-xl font-medium min-h-[44px]"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/performance" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="block px-4 py-3 text-slate-300 hover:text-orange-400 rounded-xl font-medium min-h-[44px]"
                    >
                      Batsman Card
                    </Link>
                  </>
                )}

                {/* 2. Coach Mobile Links */}
                {role === 'PROFESSIONAL' && (
                  <>
                    <Link 
                      to="/professional" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="block px-4 py-3 text-slate-300 hover:text-orange-400 rounded-xl font-medium min-h-[44px]"
                    >
                      Coach Portal
                    </Link>
                  </>
                )}

                {/* 3. Admin Mobile Links */}
                {role === 'ADMIN' && (
                  <>
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="block px-4 py-3 text-slate-300 hover:text-orange-400 rounded-xl font-medium min-h-[44px]"
                    >
                      Control Center
                    </Link>
                  </>
                )}

                {/* Shared Mobile Links */}
                <Link 
                  to="/chat" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-4 py-3 text-slate-300 hover:text-orange-400 rounded-xl font-medium min-h-[44px]"
                >
                  Messages
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-4 py-3 text-slate-300 hover:text-orange-400 rounded-xl font-medium min-h-[44px]"
                >
                  {role === 'PROFESSIONAL' ? 'Coach Profile' : role === 'ADMIN' ? 'Admin Profile' : 'Account Profile'}
                </Link>

                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 mt-2 text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-bold min-h-[44px]"
                >
                  Log Out
                </button>
              </>
            )}

            {/* Mobile Contact Quick Access */}
            <div className="pt-4 mt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 px-4">
              <a href="tel:+919368029835" className="text-orange-400 font-mono">📞 +91 93680 29835</a>
              <a href="mailto:support@dronamate.in" className="hover:underline">support@dronamate.in</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
