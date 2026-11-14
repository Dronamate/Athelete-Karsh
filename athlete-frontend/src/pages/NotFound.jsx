import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');

  const getDashboardLink = () => {
    if (role === 'ATHLETE') return '/athlete';
    if (role === 'PROFESSIONAL') return '/professional';
    if (role === 'ADMIN') return '/admin';
    return '/';
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#faf8ff] text-[#0c2340] px-4 sm:px-6 lg:px-8 py-16 font-sans overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
        {/* Cricket Bowled Visual */}
        <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 bg-orange-50 border-2 border-orange-200 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm">
            🏏
          </div>
          <span className="absolute -bottom-1 -right-1 bg-[#ff5500] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-display shadow-sm">
            Clean Bowled!
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-[#0c2340] font-display">
            404
          </h1>
          <h2 className="text-xl font-black text-[#0c2340] tracking-tight font-display">
            Howzat? You've Reached Outside the Boundary!
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            The delivery was unplayable or the page you are looking for has been moved, renamed, or is outside the field of play.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-xs font-bold rounded-lg text-white bg-[#ff5500] hover:bg-[#ea4c00] transition shadow-sm font-display min-h-[44px]"
          >
            Return to Pavilion (Home)
          </Link>

          {token ? (
            <Link
              to={getDashboardLink()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-xs font-bold rounded-lg text-[#0c2340] bg-slate-50 hover:bg-slate-100 transition font-display min-h-[44px]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-xs font-bold rounded-lg text-[#0c2340] bg-slate-50 hover:bg-slate-100 transition font-display min-h-[44px]"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Support Help Block */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-600">Need immediate booking assistance?</p>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono">
            <a href="tel:+918219486269" className="text-[#ff5500] hover:underline font-bold">
              📞 +91 8219486269
            </a>
            <span className="text-slate-300">•</span>
            <a href="mailto:info@dronamate.in" className="text-[#0c2340] hover:underline font-bold">
              ✉️ info@dronamate.in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
