import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";// npm install jwt-decode
import { API_URL } from '../../config';

// Shape of context data
const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
  refresh: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load tokens and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRefresh = localStorage.getItem('refresh_token');

    if (storedToken && storedUser && storedRefresh) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRefreshToken(storedRefresh);
      setError(null);
      setLoading(false);

      // Check if token is expired and refresh if needed
      if (isTokenExpired(storedToken)) {
        refresh(storedRefresh);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const isTokenExpired = (accessToken) => {
    try {
      const { exp } = jwtDecode(accessToken);
      return Date.now() >= exp * 1000;
    } catch (error) {
      return true; // If decode fails, treat as expired
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // If your API returns a refresh token, store it
        // For demo, assume `data.refresh_token` is returned
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
          setRefreshToken(data.refresh_token);
        }

        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        setError(null);
        return { success: true, user: data.user };
      } else {
        setError(data.errors || 'Login failed');
        setLoading(false);
        return { success: false, error: data.errors || 'Login failed' };
      }
    } catch (err) {
      setError('Network error, please try again later');
      setLoading(false);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  const refresh = async (storedRefreshToken = refreshToken) => {
    if (!storedRefreshToken) {
      // No refresh token available, log out
      logout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: storedRefreshToken })
      });

      const data = await response.json();
      if (response.ok) {
        // Update token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setError(null);
      } else {
        setError(data.errors || 'Token refresh failed');
        logout();
      }
    } catch (err) {
      setError('Failed to refresh token');
      logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        refresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;