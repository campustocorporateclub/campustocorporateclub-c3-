import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('c3user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('c3user');
    return null;
  }
};

const isPublicRoute = (pathname) => {
  return (
    (pathname === '/') ||
    (pathname === '/login') ||
    (pathname === '/register') ||
    (pathname === '/gallery') ||
    (pathname === '/sessions-archive') ||
    (pathname.startsWith('/apply')) ||
    (pathname.startsWith('/events/')) ||
    (pathname === '/events')
  );
};

export const AuthProvider = ({ children }) => {
  // Render immediately with stored user - do NOT block first render on /auth/me
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);
  const lastCheckedRef = useRef(0);

  const refreshUser = useCallback(async () => {
    const stored = getStoredUser();
    if (!stored?.token) return;

    try {
      const res = await api.get('/auth/me');
      const me = res.data; // { _id, name, email, role, isApproved, isOwner, year, section }

      const current = getStoredUser() || {};
      const updated = {
        ...current,
        ...me,
        token: current.token, // preserve active session token
      };

      const roleChanged = current.role !== updated.role;
      const approvalRevoked = !updated.isApproved && updated.role !== 'admin';

      localStorage.setItem('c3user', JSON.stringify(updated));
      setUser(updated);
      lastCheckedRef.current = Date.now();

      // If refreshed role or approval differs from stored, redirect appropriately
      if (roleChanged || approvalRevoked) {
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          if (approvalRevoked) {
            localStorage.removeItem('c3user');
            setUser(null);
            window.location.href = '/login';
          } else if (updated.role !== 'admin' && pathname.startsWith('/admin')) {
            // Demoted admin loses admin access -> send to dashboard
            window.location.href = '/dashboard';
          } else if (
            updated.role !== 'admin' &&
            updated.role !== 'coordinator' &&
            pathname.startsWith('/staff')
          ) {
            // Demoted coordinator loses staff access -> send to dashboard
            window.location.href = '/dashboard';
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('c3user');
        setUser(null);
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          if (!isPublicRoute(pathname)) {
            window.location.href = '/login';
          }
        }
      } else if (err.response?.status === 403) {
        // e.g. unapproved member revoked
        localStorage.removeItem('c3user');
        setUser(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      // If network failure: keep stored user silently and don't show an error
    }
  }, []);

  useEffect(() => {
    // Initial background refresh if token is available
    const stored = getStoredUser();
    if (stored?.token) {
      refreshUser();
    }

    // Re-check /auth/me when the tab becomes visible or focused (60-second debounce to prevent lag on mobile app switching)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastCheckedRef.current >= 60000) {
          refreshUser();
        }
      }
    };

    const handleAuthRefreshEvent = () => {
      refreshUser();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'c3user') {
        try {
          const newUser = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(newUser);
        } catch {
          // ignore parse error
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('c3:auth-refresh', handleAuthRefreshEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('c3:auth-refresh', handleAuthRefreshEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('c3user', JSON.stringify(res.data));
    setUser(res.data);
    lastCheckedRef.current = Date.now();
    return res.data;
  };

  const register = async (name, email, password, year, section, registerNumber) => {
    const res = await api.post('/auth/register', { name, email, password, year, section, registerNumber });
    return res.data;
  };

  const updateUser = (fields) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...fields };
      localStorage.setItem('c3user', JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem('c3user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);