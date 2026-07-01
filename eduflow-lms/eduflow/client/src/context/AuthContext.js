import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api.service';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken]     = useState(localStorage.getItem('eduflow_token'));

  const loadUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.data);
    } catch {
      localStorage.removeItem('eduflow_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('eduflow_token', data.token);
    setToken(data.token);
    setUser(data.data);
    toast.success(`Welcome back, ${data.data.name}! 🎓`);
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('eduflow_token', data.token);
    setToken(data.token);
    setUser(data.data);
    toast.success('Account created! Please check your email to verify.');
    return data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('eduflow_token');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

  const isEnrolled = (courseId) =>
    user?.enrolledCourses?.some(e => (e.course?._id || e.course) === courseId) || false;

  const isWishlisted = (courseId) =>
    user?.wishlist?.some(w => (w._id || w) === courseId) || false;

  return (
    <AuthContext.Provider value={{
      user, loading, token,
      login, register, logout, updateUser,
      isEnrolled, isWishlisted,
      isAuthenticated: !!user,
      isStudent:    user?.role === 'student',
      isInstructor: user?.role === 'instructor',
      isAdmin:      user?.role === 'admin',
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
