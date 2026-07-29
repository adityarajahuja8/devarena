import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hs_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Fetch fresh user from server on mount
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('hs_token');
      if (!token && !document.cookie.includes('hacksphere_token')) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        const freshUser = res.data.data.user;
        setUser(freshUser);
        localStorage.setItem('hs_user', JSON.stringify(freshUser));
      } catch {
        setUser(null);
        localStorage.removeItem('hs_user');
        localStorage.removeItem('hs_token');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: loggedIn, token } = res.data.data;
    setUser(loggedIn);
    localStorage.setItem('hs_user', JSON.stringify(loggedIn));
    if (token) localStorage.setItem('hs_token', token);
    return loggedIn;
  }, []);

  const signup = useCallback(async (data) => {
    const res = await authService.signup(data);
    // Only log in if participant (immediate approval)
    if (res.data.data?.token) {
      const { user: newUser, token } = res.data.data;
      setUser(newUser);
      localStorage.setItem('hs_user', JSON.stringify(newUser));
      localStorage.setItem('hs_token', token);
    }
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    setUser(null);
    localStorage.removeItem('hs_user');
    localStorage.removeItem('hs_token');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hs_user', JSON.stringify(updatedUser));
  }, []);

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const isParticipant = user?.role === 'participant';
  const isJudge = user?.role === 'judge';
  const isAuthenticated = !!user;
  const isApproved = user?.status === 'approved';

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, logout, updateUser,
      isAdmin, isOrganizer, isParticipant, isJudge,
      isAuthenticated, isApproved,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
