import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHexagon, FiUser, FiLogOut, FiMenu, FiX, FiBell, FiSearch, FiCode, FiLayers } from 'react-icons/fi';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isOrganizer, isJudge, isParticipant } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isOrganizer) return '/organizer/dashboard';
    if (isJudge) return '/judge/dashboard';
    return '/participant/dashboard';
  };

  const navLinks = [
    { label: 'Explore', path: '/hackathons' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#050810]/90 backdrop-blur-2xl border-b border-[#06b6d4]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Status Pill */}
        <div className="flex items-center gap-6">
          <Link to={isAuthenticated ? getDashboardLink() : '/'} className="flex items-center gap-3 group">

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#06b6d4] to-[#0e7490] p-[1px]">
              <div className="w-full h-full bg-[#0a0e1a] rounded-xl flex items-center justify-center group-hover:bg-transparent transition duration-300">
                <FiHexagon className="text-[#67e8f9] group-hover:text-white text-lg" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                Dev<span className="text-[#67e8f9]">Arena</span>
              </span>
            </div>
          </Link>

          {/* System Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono-code tracking-wider text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM STABLE: DEVARENA</span>
          </div>
        </div>

        {/* Center: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/hackathons"
            className={`text-xs font-mono-code uppercase tracking-wider transition ${
              location.pathname === '/hackathons' ? 'text-[#67e8f9] font-bold border-b border-[#06b6d4] pb-1' : 'text-gray-400 hover:text-white'
            }`}
          >
            Explore
          </Link>
          
          {isAuthenticated && (
            <Link
              to={getDashboardLink()}
              className={`text-xs font-mono-code uppercase tracking-wider transition ${
                location.pathname.includes('/dashboard') ? 'text-[#67e8f9] font-bold border-b border-[#06b6d4] pb-1' : 'text-gray-400 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right: Auth & Profile */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* User badge */}
              <Link to="/profile" className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-gray-200 max-w-[120px] truncate leading-tight">{user.name}</span>
                  <span className="text-[9px] font-mono-code text-[#67e8f9] uppercase tracking-wider">{user.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#06b6d4]/20 border border-[#06b6d4]/40 flex items-center justify-center font-bold text-xs text-[#67e8f9] uppercase">
                  {user.name ? user.name[0] : 'U'}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-white/[0.04] hover:bg-red-500/20 hover:text-red-300 text-gray-400 border border-white/10 transition"
                title="Logout"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0e1a] border-b border-white/10 px-4 py-5 space-y-3 font-mono-code text-xs uppercase">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-gray-300 py-1.5">Home</Link>
          <Link to="/hackathons" onClick={() => setMobileOpen(false)} className="block text-gray-300 py-1.5">Explore Hackathons</Link>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block text-[#67e8f9] font-bold py-1.5">Dashboard</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-gray-300 py-1.5">Profile ({user.name})</Link>
              <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="w-full text-left text-red-400 py-1.5">Logout</button>
            </>
          ) : (
            <div className="flex flex-col gap-2.5 pt-3 border-t border-white/10">
              <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full">Sign In</Button></Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}><Button variant="primary" className="w-full">Get Started</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

