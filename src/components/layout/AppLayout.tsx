import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const AppLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const navItems = [
    {
      name: 'My Farm',
      path: '/fields',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      activeMatch: (pathname: string) =>
        pathname === '/fields' ||
        pathname === '/dashboard' ||
        (pathname.startsWith('/fields/') &&
          !pathname.includes('/checkin') &&
          !pathname.includes('/strategies')),
    },
    {
      name: 'Plan Crop',
      path: '/fields',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      activeMatch: (pathname: string) =>
        pathname.includes('/checkin') || pathname.includes('/strategies'),
    },
    {
      name: 'Community',
      path: '/community',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      activeMatch: (pathname: string) => pathname.startsWith('/community'),
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      activeMatch: (pathname: string) => pathname === '/settings',
    },
  ];

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Farmer';

  return (
    <div className="min-h-screen bg-[#F6F9F6] flex flex-col lg:flex-row text-[#0F172A] font-sans antialiased">
      {/* Desktop Sidebar - Modern Floating Styled */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-[#1B4332] text-white flex-shrink-0 relative overflow-hidden shadow-xl">
        {/* Subtle Decorative Aura */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-800/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-[#1B4332] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#1B4332] rounded-[14px] flex items-center justify-center text-xl">
                🌱
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                TerraCrop
              </h1>
              <p className="text-[11px] text-emerald-300 font-medium">
                NASA Data For Farms
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-700/50">
            PRO
          </span>
        </div>

        {/* Farmer Profile Card inside Sidebar */}
        <div className="mx-4 mt-5 p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-emerald-300 font-medium truncate">
              Welcome back,
            </div>
            <div className="text-sm font-bold text-white truncate">
              {displayName}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
          <div className="text-[11px] font-semibold text-emerald-300/80 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = item.activeMatch(location.pathname);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3.5 min-h-[48px] px-4 py-3 rounded-2xl font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#1B4332] shadow-md font-bold'
                    : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'text-[#1B4332]' : 'text-emerald-300'
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sign Out Footer */}
        <div className="p-4 border-t border-emerald-800/40">
          <button
            onClick={handleSignOut}
            type="button"
            className="w-full min-h-[48px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-900/50 hover:bg-red-900/70 text-emerald-200 hover:text-white transition-all text-xs font-semibold border border-emerald-800/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 lg:pb-8">
        {/* Mobile Top Header (Clean Minimalist Banner) */}
        <header className="lg:hidden bg-gradient-to-r from-[#1B4332] to-[#133E2B] text-white px-5 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-lg shadow-xs">
              🌱
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight leading-tight">
                TerraCrop
              </div>
              <div className="text-[10px] text-emerald-200 flex items-center gap-1">
                <span>📍 Sri Lanka</span>
                <span>•</span>
                <span>NASA POWER Feed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700/80 text-white flex items-center justify-center text-xs font-bold border border-emerald-500/50">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-red-800/80 text-emerald-200 hover:text-white transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Dock Bottom Navigation Bar (Inspired by Image 2 & 3) */}
      <nav
        className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200/80 z-50 rounded-full px-3 py-2 shadow-2xl flex items-center justify-around"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const isActive = item.activeMatch(location.pathname);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-1.5 min-h-[48px] px-3.5 py-2 rounded-full text-xs transition-all ${
                isActive
                  ? 'bg-[#1B4332] text-white font-bold shadow-md'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </span>
              {isActive && <span className="text-xs">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
