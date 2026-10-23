import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, isDemoFallbackEnabled } from '../services/api';
import { INITIAL_STUDENTS } from '../services/seedData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusfind_user');
    const token = localStorage.getItem('campusfind_token');
    if (saved && token) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return isDemoFallbackEnabled() ? INITIAL_STUDENTS[1] : null;
  });

  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('campusfind_user');
    const token = localStorage.getItem('campusfind_token');
    if (saved && token) {
      return token;
    }
    return isDemoFallbackEnabled() ? 'demo_token_parthvi' : null;
  });

  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('campusfind_user');
    const token = localStorage.getItem('campusfind_token');
    const savedRole = localStorage.getItem('campusfind_role');
    if (saved && token) {
      return savedRole || 'student';
    }
    return isDemoFallbackEnabled() ? (savedRole || 'student') : null;
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.StudentID && role === 'student') {
      api.getNotifications(user.StudentID)
        .then((notifs) => {
          if (Array.isArray(notifs)) {
            setUnreadCount(notifs.filter((n) => !n.ReadStatus).length);
          }
        })
        .catch(() => { });
    }
  }, [user, role]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (email.toLowerCase().includes('admin')) {
        const res = await api.adminLogin(email, password);
        setUser(res.admin);
        setRole('admin');
        setToken(res.token);
        localStorage.setItem('campusfind_role', 'admin');
        return { success: true, role: 'admin', user: res.admin };
      }

      const res = await api.login(email, password);
      setUser(res.student);
      setRole('student');
      setToken(res.token);
      localStorage.setItem('campusfind_role', 'student');
      return { success: true, role: 'student', student: res.student };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      await api.register(formData);
      const res = await api.login(formData.email, formData.password);
      setUser(res.student);
      setRole('student');
      setToken(res.token);
      localStorage.setItem('campusfind_role', 'student');
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setUnreadCount(0);
    localStorage.removeItem('campusfind_token');
    localStorage.removeItem('campusfind_user');
    localStorage.removeItem('campusfind_role');
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('campusfind_role', newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        unreadCount,
        setUnreadCount,
        login,
        register,
        logout,
        switchRole,
        updateUser: (updated) => {
          setUser(updated);
          localStorage.setItem('campusfind_user', JSON.stringify(updated));
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}