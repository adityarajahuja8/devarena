import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { FiHexagon, FiLock, FiMail, FiUser, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'participant',
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await signup(formData);
      if (formData.role === 'organizer' || formData.role === 'judge') {
        toast.success(res.message || 'Account created! Pending Admin approval.');
        navigate('/pending-approval');
      } else {
        toast.success('Registration successful! Welcome aboard.');
        navigate('/participant/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Atmosphere Background Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-[#06b6d4]/8 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full max-w-[520px]">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06b6d4] to-[#0e7490] flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <FiHexagon className="text-white text-xl" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">
              Dev<span className="text-[#06b6d4]">Arena</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1">Join DevArena — Where Innovation Competes.</p>
        </div>

        {/* Signup Card */}
        <div className="glass-card p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
          {/* Role Selector */}
          <div className="mb-6">
            <label className="text-[11px] font-mono-code uppercase tracking-wider text-gray-400 block mb-2">
              Choose Your Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#0a0e1a] rounded-xl border border-[#06b6d4]/15">
              {[
                { id: 'participant', label: 'Participant' },
                { id: 'organizer', label: 'Organizer' },
                { id: 'judge', label: 'Judge' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.id })}
                  className={`py-2.5 px-3 rounded-lg text-xs font-mono-code uppercase tracking-wider font-bold transition-all ${
                    formData.role === r.id
                      ? 'bg-gradient-to-r from-[#06b6d4] to-[#0e7490] text-white shadow-lg shadow-[#06b6d4]/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {(formData.role === 'organizer' || formData.role === 'judge') && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-start gap-3 text-xs text-gray-300">
                <FiInfo className="text-[#67e8f9] shrink-0 mt-0.5" size={16} />
                <span>
                  Note: <strong className="text-white">{formData.role}</strong> accounts require Admin approval before you can access management features.
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono-code uppercase tracking-wider text-gray-400 block mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  className="input-field pl-11"
                  placeholder="Hacker Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono-code uppercase tracking-wider text-gray-400 block mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  className="input-field pl-11"
                  placeholder="dev@devarena.io"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono-code uppercase tracking-wider text-gray-400 block mb-2">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  className="input-field pl-11"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full py-3.5 mt-4 font-bold">
              Create {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Account
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#38bdf8] font-bold hover:text-[#67e8f9] hover:underline transition">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

