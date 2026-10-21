import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');

  const getDashboardLink = () => {
    if (role === 'ATHLETE') return '/athlete';
    if (role === 'PROFESSIONAL') return '/professional';
    if (role === 'ADMIN') return '/admin';
    return '/';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Cricket Bowled Visual */}
        <div className="relative inline-block mx-auto">
          <div className="w-28 h-28 bg-orange-500/10 border-2 border-orange-500/30 rounded-full flex items-center justify-center text-5xl mx-auto shadow-2xl shadow-orange-500/20 animate-bounce">
            🏏
          </div>
          <span className="absolute -bottom-2 -right-2 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            Out!
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Howzat? You've Been Clean Bowled!
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            The delivery went wide of the pitch. The page you are looking for has been removed, renamed, or is outside the boundary rope.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 focus:outline-none transition-all shadow-lg shadow-orange-500/25 min-h-[44px]"
          >
            Return to Pavilion (Home)
          </Link>

          {token ? (
            <Link
              to={getDashboardLink()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-slate-700 text-sm font-bold rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-700 transition min-h-[44px]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-slate-700 text-sm font-bold rounded-xl text-slate-300 bg-slate-800/80 hover:bg-slate-700 transition min-h-[44px]"
            >
              Previous Ball (Go Back)
            </button>
          )}
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          Need assistance? Reach our coaching team at{' '}
          <a href="mailto:support@dronamate.in" className="text-orange-400 hover:underline">
            support@dronamate.in
          </a>
        </div>
      </div>
    </div>
  );
}
