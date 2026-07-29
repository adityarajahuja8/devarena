import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { FiHexagon, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

      if (loggedInUser.role === 'admin') navigate('/admin/dashboard');
      else if (loggedInUser.role === 'organizer') navigate('/organizer/dashboard');
      else if (loggedInUser.role === 'judge') navigate('/judge/dashboard');
      else navigate('/participant/dashboard');
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute w-[450px] h-[450px] bg-[#a078ff]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full max-w-[460px]">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#a078ff] to-[#6d3bd7] flex items-center justify-center shadow-[0_0_20px_rgba(160,120,255,0.3)]">
              <FiHexagon className="text-white text-xl" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">
              Dev<span className="text-[#d0bcff]">Arena</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">Where Innovation Competes. Your workspace awaits.</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-mono-code uppercase tracking-wider text-gray-400 block mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  className="input-field pl-11"
                  placeholder="hacker@void.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono-code uppercase tracking-wider text-gray-400">
                  Password
                </label>
                <a href="#" className="text-xs text-[#d0bcff] hover:underline font-mono-code">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full py-3.5 mt-2 font-bold">
              Log In
            </Button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-mono-code uppercase tracking-widest">
              <span className="px-3 bg-[#0e0e0e] text-gray-500">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono-code text-gray-300 flex items-center justify-center gap-2 transition">
              <span>Google</span>
            </button>
            <button type="button" className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono-code text-gray-300 flex items-center justify-center gap-2 transition">
              <span>GitHub</span>
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#d0bcff] font-bold hover:underline">
              Sign Up
            </Link>
          </div>
        </div>

        <p className="text-[11px] font-mono-code text-gray-500 text-center mt-6 max-w-xs mx-auto">
          Organizers and Judges require admin approval after signup. All actions are logged.
        </p>
      </div>
    </div>
  );
};

export default Login;

