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
    navigate('/login');
  };

  // Dynamically determine where the "Dashboard" button should go based on role
  const getDashboardLink = () => {
    if (role === 'ATHLETE') return '/athlete';
    if (role === 'PROFESSIONAL') return '/professional';
    if (role === 'ADMIN') return '/admin';
    return '/'; // Fallback
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Side: Brand Logo / Name */}
          <div className="flex items-center">
            <Link to={token ? getDashboardLink() : "/"} className="text-2xl font-bold text-orange-500 tracking-tight hover:text-orange-400 transition flex items-center gap-2">
              <span className="bg-orange-500 text-slate-900 w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm font-extrabold">D</span>
              DronaMate
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white focus:outline-none"
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
                <Link to="/" className="text-slate-300 hover:text-orange-500 transition font-medium text-sm">For Athletes</Link>
                <Link to="/" className="text-slate-300 hover:text-orange-500 transition font-medium text-sm">For Coaches</Link>
                <Link to="/" className="text-slate-300 hover:text-orange-500 transition font-medium text-sm">Performance</Link>
                <Link to="/" className="text-slate-300 hover:text-orange-500 transition font-medium text-sm">About</Link>
                <div className="h-6 w-px bg-slate-700 mx-2"></div>
                <Link to="/login" className="text-slate-300 hover:text-orange-500 transition font-semibold text-sm">
                  Login
                </Link>
                <Link to="/register" className="bg-orange-500 text-white hover:bg-orange-600 px-5 py-2 rounded-full text-sm font-bold transition shadow-md shadow-orange-500/20">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link to={getDashboardLink()} className="text-slate-300 hover:text-orange-500 transition font-semibold text-sm">
                  Dashboard
                </Link>
                <Link to="/learning" className="text-slate-300 hover:text-orange-500 transition font-semibold text-sm">
                  Learning Hub
                </Link>
                <Link to="/chat" className="text-slate-300 hover:text-orange-500 transition font-semibold text-sm">
                  Messages
                </Link>
                {role === 'ADMIN' && (
                  <Link to="/admin" className="text-slate-300 hover:text-orange-500 transition font-semibold text-sm">
                    Control Center
                  </Link>
                )}
                <Link to="/profile" className="text-slate-300 hover:text-orange-500 transition font-semibold text-sm">
                  Account
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-full text-sm font-bold transition shadow-sm"
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
        <div className="md:hidden bg-slate-800 border-b border-slate-700 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            {!token ? (
              <>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-slate-300 hover:text-orange-500 hover:bg-slate-700/50 rounded-md font-medium">For Athletes</Link>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-slate-300 hover:text-orange-500 hover:bg-slate-700/50 rounded-md font-medium">For Coaches</Link>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-slate-300 hover:text-orange-500 hover:bg-slate-700/50 rounded-md font-medium">Performance</Link>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-slate-300 hover:text-orange-500 hover:bg-slate-700/50 rounded-md font-medium">About</Link>
                <hr className="border-slate-700 my-2" />
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-slate-300 hover:text-orange-500 font-semibold">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-center bg-orange-500 text-white rounded-lg font-bold mt-2">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link to={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-slate-300 hover:text-orange-500 rounded-md font-medium">Dashboard</Link>
                <Link to="/learning" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-slate-300 hover:text-orange-500 rounded-md font-medium">Learning Hub</Link>
                <Link to="/chat" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-slate-300 hover:text-orange-500 rounded-md font-medium">Messages</Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-slate-300 hover:text-orange-500 rounded-md font-medium">Account</Link>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-3 mt-2 text-white bg-slate-700 rounded-md font-bold"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}