import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stored auth state on mount
  useEffect(() => {
    const storedTokens = localStorage.getItem('tokens');
    const storedUser = localStorage.getItem('user');
    if (storedTokens && storedUser) {
      try {
        setTokens(JSON.parse(storedTokens));
        setUser(JSON.parse(storedUser));
      } catch {
        // Clear corrupt data
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /** Store auth data from any login/register response */
  const setAuthFromResponse = useCallback((data) => {
    const { user: userData, tokens: tokenData } = data;
    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem('tokens', JSON.stringify(tokenData));
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }, []);

  /**
   * Smart login: uses /auth/smart/ which auto-detects existing vs new user.
   * Returns the user object on successful login.
   * Throws error with { action: 'needs_registration' } if user doesn't exist.
   */
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/smart/', { email, password });
    // Successful login returns tokens
    if (response.data.tokens) {
      return setAuthFromResponse(response.data);
    }
    // User doesn't exist — signal needs_registration
    const err = new Error('needs_registration');
    err.data = response.data;
    throw err;
  }, [setAuthFromResponse]);

  /** Full registration via /register/ endpoint */
  const register = useCallback(async (data) => {
    const response = await api.post('/register/', data);
    return setAuthFromResponse(response.data);
  }, [setAuthFromResponse]);

  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.get('/profile/');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = !!tokens && !!user;
  const isAdmin = user?.user_type === 'admin' || false;

  const value = {
    user,
    tokens,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    setAuthFromResponse,
    logout,
    refreshProfile,
    refreshUser: refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
