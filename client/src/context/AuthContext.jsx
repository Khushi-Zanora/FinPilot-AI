import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      setLoading(true);
      const res = await apiRequest('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        localStorage.removeItem('finpilot_token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('finpilot_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login({ email, password }) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.data?.user) {
      if (res.data?.token) {
        localStorage.setItem('finpilot_token', res.data.token);
      }
      setUser(res.data.user);
    }
    return res;
  }

  async function register({ name, email, password, currency = 'INR' }) {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, currency })
    });
    if (res.success && res.data?.user) {
      if (res.data?.token) {
        localStorage.setItem('finpilot_token', res.data.token);
      }
      setUser(res.data.user);
    }
    return res;
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('finpilot_token');
      setUser(null);
    }
  }

  const isPremium = user?.plan === 'premium';

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        checkCurrentUser,
        isPremium
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
