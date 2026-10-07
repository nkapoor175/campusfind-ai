import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { INITIAL_STUDENTS } from '../services/seedData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusfind_user');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS[1];
  });
  const [role, setRole] = useState(() => {
    return localStorage.getItem('campusfind_role') || 'student';
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('campusfind_token') || 'demo_token_parthvi';
  });
  const [unreadCount, setUnreadCount] = useState(2);
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
      const student = await api.register(formData);
      setUser(student);
      setRole('student');
      localStorage.setItem('campusfind_role', 'student');
      return student;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole('student');
    localStorage.removeItem('campusfind_token');
    localStorage.removeItem('campusfind_user');
    localStorage.removeItem('campusfind_role');
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