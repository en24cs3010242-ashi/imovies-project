import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('imovies_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync and verify current user on startup
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          localStorage.setItem('imovies_user', JSON.stringify(res.user));
        } catch (err) {
          console.warn('[AuthContext] Session invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('imovies_token', res.token);
    localStorage.setItem('imovies_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('imovies_token', res.token);
    localStorage.setItem('imovies_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    setUser(res.user);
    localStorage.setItem('imovies_user', JSON.stringify(res.user));
    return res.user;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: !!user && user.role === 'admin',
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

