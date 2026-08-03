import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCallback } from 'react';
import {
  FiGrid, FiCompass, FiUsers, FiTerminal, FiSettings, FiPlus, FiHexagon, FiLogOut
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, isAuthenticated, logout, isAdmin, isOrganizer, isJudge } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isOrganizer) return '/organizer/dashboard';
    if (isJudge) return '/judge/dashboard';
    return '/participant/dashboard';
  };

  const dashboardLink = getDashboardLink();

  const navItems = [
    { label: 'Dashboard', path: dashboardLink, icon: FiGrid },
    { label: 'Explore', path: '/hackathons', icon: FiCompass },
    { label: 'Profile & Settings', path: '/profile', icon: FiSettings },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-[#06b6d4]/10 bg-[#070b14]/95 backdrop-blur-3xl z-40 flex flex-col hidden lg:flex font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <Link to={dashboardLink} className="flex items-center gap-3 group">

          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#06b6d4] to-[#0e7490] flex items-center justify-center font-bold text-white">
            <FiHexagon size={18} />
          </div>
          <div>
            <h1 className="text-lg font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#67e8f9] to-[#38bdf8]">
              DevArena
            </h1>
            <p className="text-[9px] font-mono-code uppercase tracking-widest text-gray-500">Where Innovation Competes</p>
          </div>
        </Link>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Navigation Links */}
        <nav className="space-y-2 font-mono-code text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#06b6d4]/15 text-[#67e8f9] border-r-2 border-[#06b6d4] font-bold shadow-lg shadow-[#06b6d4]/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`text-lg ${isActive ? 'text-[#67e8f9]' : 'text-gray-400'}`} />
                <span className="uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>


      {/* Action Button tailored by role */}
      <div className="p-6 space-y-4 border-t border-white/5">
        <button
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0369a1] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          onClick={() => {
            if (isOrganizer) {
              // If already on dashboard, just open modal via event
              if (location.pathname === '/organizer/dashboard') {
                window.dispatchEvent(new Event('open-create-hackathon'));
              } else {
                // Navigate to dashboard first, then modal will open via event
                navigate('/organizer/dashboard');
                setTimeout(() => window.dispatchEvent(new Event('open-create-hackathon')), 200);
              }
            } else if (isJudge) {
              navigate('/judge/dashboard');
            } else {
              navigate('/hackathons');
            }
          }}
        >
          <FiPlus size={16} />
          <span>
            {isOrganizer ? 'Create Event' : isJudge ? 'View Submissions' : 'Explore Events'}
          </span>
        </button>



        {/* User Mini Profile Card */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#06b6d4]/20 border border-[#06b6d4]/40 flex items-center justify-center font-bold text-xs text-[#67e8f9] uppercase shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white truncate">{user?.name}</span>
              <span className="text-[10px] font-mono-code text-[#67e8f9] uppercase tracking-wider truncate">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={async () => { await logout(); navigate('/login'); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Logout"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
