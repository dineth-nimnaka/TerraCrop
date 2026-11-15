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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        pathname.startsWith('/fields/'),
    },
    {
      name: 'Plan Crop',
      path: '/fields',
      secondaryText: 'Select field to plan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  return (
    <div className="min-h-screen bg-[#F3F7F4] flex flex-col lg:flex-row text-[#0F172A]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#1B4332] text-white flex-shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-[#2D6A4F]/40 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#1B4332] flex items-center justify-center font-bold text-xl shadow-sm">
            🌱
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">TerraCrop</h1>
            <p className="text-xs text-emerald-200">NASA Data for Farms</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = item.activeMatch(location.pathname);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 min-h-[48px] px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#1B4332] shadow-sm font-semibold'
                    : 'text-emerald-100 hover:bg-[#2D6A4F] hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-[#2D6A4F]/40">
          <div className="px-3 py-2 text-xs text-emerald-200 truncate">
            Signed in as:
            <div className="font-semibold text-white truncate text-sm">
              {user?.email}
            </div>
            {!user?.emailVerified && (
              <span className="inline-block mt-1 text-[11px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-medium">
                Unverified Email
              </span>
            )}
          </div>
          <button
            onClick={handleSignOut}
            type="button"
            className="w-full mt-3 min-h-[48px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-emerald-100 hover:bg-red-800/80 hover:text-white transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Mobile Top Header */}
        <header className="lg:hidden bg-[#1B4332] text-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌱</span>
            <span className="font-bold text-lg">TerraCrop</span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-emerald-200 truncate max-w-[150px]">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-2.5 py-1.5 bg-[#2D6A4F] hover:bg-red-800 text-white rounded-lg text-xs font-medium"
              title="Sign Out"
            >
              Exit
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (min 48px touch targets) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex items-stretch justify-around px-2 py-1 shadow-lg"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const isActive = item.activeMatch(location.pathname);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center min-h-[52px] py-1 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[#1B4332] font-bold bg-[#F3F7F4]'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <div className="w-5 h-5 mb-0.5">{item.icon}</div>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
