import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { FiHexagon, FiLock, FiMail, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DEMO_EMAIL    = 'admin@devarena.dev';
const DEMO_PASSWORD = 'Admin@12345';

const Login = () => {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const { login } = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      toast.success(`Welcome back, ${loggedInUser.name}!`);

      if (loggedInUser.role === 'admin')          navigate('/admin/dashboard');
      else if (loggedInUser.role === 'organizer') navigate('/organizer/dashboard');
      else if (loggedInUser.role === 'judge')     navigate('/judge/dashboard');
      else                                         navigate('/participant/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      if (err.response?.data?.data?.status === 'pending') {
        navigate('/pending-approval');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setLoading(true);
    try {
      const loggedInUser = await login(DEMO_EMAIL, DEMO_PASSWORD);
      toast.success(`Welcome, ${loggedInUser.name}! 👋`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Demo login failed — make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute w-[500px] h-[500px] bg-[#06b6d4]/8 rounded-full blur-[120px] pointer-events-none -z-10 top-1/4 -left-32 animate-pulse" />
      <div className="absolute w-[350px] h-[350px] bg-[#0369a1]/10 rounded-full blur-[100px] pointer-events-none -z-10 bottom-10 right-0" />

      <div className="w-full max-w-[460px]">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06b6d4] to-[#0e7490] flex items-center justify-center shadow-[0_0_24px_rgba(6,182,212,0.3)]">
              <FiHexagon className="text-white text-xl" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">
              Dev<span className="text-[#67e8f9]">Arena</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Welcome back</h1>
          <p className="text-sm text-[#5a7a8a] mt-1">Where Innovation Competes. Your workspace awaits.</p>
        </div>

        {/* ── Demo Credentials Banner ── */}
        <div className="mb-5 rounded-2xl border border-[#06b6d4]/25 bg-[#06b6d4]/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FiZap className="text-[#38bdf8] text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#67e8f9] uppercase tracking-widest mb-1.5">Demo Access</p>
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2 text-xs font-mono-code text-gray-400">
                  <span className="text-[#5a7a8a]">Email</span>
                  <span className="text-[#e8f4f8] select-all">{DEMO_EMAIL}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono-code text-gray-400">
                  <span className="text-[#5a7a8a]">Pass</span>
                  <span className="text-[#e8f4f8] select-all">{DEMO_PASSWORD}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-2 rounded-xl text-xs font-bold font-mono-code tracking-wider text-[#0a0e1a] bg-gradient-to-r from-[#06b6d4] to-[#38bdf8] hover:from-[#22d3ee] hover:to-[#7dd3fc] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(6,182,212,0.25)]"
              >
                {loading ? 'Logging in…' : '⚡ Try as Admin →'}
              </button>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8 md:p-10 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-mono-code uppercase tracking-wider text-[#5a7a8a] block mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a7a8a]" />
                <input
                  type="email"
                  className="input-field pl-11"
                  placeholder="hacker@ocean.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono-code uppercase tracking-wider text-[#5a7a8a]">
                  Password
                </label>
                <a href="#" className="text-xs text-[#38bdf8] hover:text-[#67e8f9] hover:underline font-mono-code transition">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a7a8a]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a7a8a] hover:text-[#67e8f9] transition"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full py-3.5 mt-2 font-bold">
              Log In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#06b6d4]/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-mono-code uppercase tracking-widest">
              <span className="px-3 bg-[#0a0e1a] text-[#5a7a8a]">or sign in with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="py-2.5 rounded-xl border border-[#06b6d4]/15 bg-[#06b6d4]/5 hover:bg-[#06b6d4]/10 text-xs font-mono-code text-gray-300 flex items-center justify-center gap-2 transition">
              <span>Google</span>
            </button>
            <button type="button" className="py-2.5 rounded-xl border border-[#06b6d4]/15 bg-[#06b6d4]/5 hover:bg-[#06b6d4]/10 text-xs font-mono-code text-gray-300 flex items-center justify-center gap-2 transition">
              <span>GitHub</span>
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-[#5a7a8a]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#38bdf8] font-bold hover:text-[#67e8f9] hover:underline transition">
              Sign Up
            </Link>
          </div>
        </div>

        <p className="text-[11px] font-mono-code text-[#5a7a8a] text-center mt-6 max-w-xs mx-auto">
          Organizers and Judges require admin approval after signup. All actions are logged.
        </p>
      </div>
    </div>
  );
};

export default Login;
