import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('c3user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('c3user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const register = async (name, email, password, year) => {
    const res = await api.post('/auth/register', { name, email, password, year });
    localStorage.setItem('c3user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('c3user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);