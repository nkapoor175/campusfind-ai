import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { INITIAL_STUDENTS, INITIAL_ADMIN } from '../services/seedData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusfind_user');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS[1]; // Parthvi Sharma by default
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
        .catch(() => {});
    }
  }, [user, role]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (email.toLowerCase().includes('admin')) {
        // Admin login
        setUser(INITIAL_ADMIN);
        setRole('admin');
        setToken('admin_token_active');
        localStorage.setItem('campusfind_user', JSON.stringify(INITIAL_ADMIN));
        localStorage.setItem('campusfind_role', 'admin');
        localStorage.setItem('campusfind_token', 'admin_token_active');
        return { success: true, role: 'admin' };
      }

      const res = await api.login(email, password);
      setUser(res.student);
      setRole('student');
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
      localStorage.setItem('campusfind_user', JSON.stringify(student));
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

  const switchRole = (newRole) => {
    if (newRole === 'admin') {
      setUser(INITIAL_ADMIN);
      setRole('admin');
      localStorage.setItem('campusfind_user', JSON.stringify(INITIAL_ADMIN));
      localStorage.setItem('campusfind_role', 'admin');
    } else {
      setUser(INITIAL_STUDENTS[1]);
      setRole('student');
      localStorage.setItem('campusfind_user', JSON.stringify(INITIAL_STUDENTS[1]));
      localStorage.setItem('campusfind_role', 'student');
    }
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
