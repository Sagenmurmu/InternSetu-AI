import React, { createContext, useState, useEffect } from 'react';
import api, { saveToStorage, KEYS } from '../services/api';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Verify token and fetch latest profile details from API
          const response = await api.get('/auth/me');
          const resData = response.data;
          const userProfile = resData.success ? resData.data : resData;
          const normalized = authService.normalizeUser(userProfile);
          setUser(normalized);
          saveToStorage(KEYS.CURRENT_USER, normalized);
        } else {
          // Check localStorage as fallback if no token
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            setUser(authService.normalizeUser(storedUser));
          }
        }
      } catch (e) {
        console.error('Failed to restore user session:', e);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      const loggedInUser = await authService.login(email, password, role);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const registeredUser = await authService.register(userData);
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = (profileData) => {
    const updatedUser = authService.updateCurrentUserProfile(profileData);
    if (updatedUser) {
      setUser(updatedUser);
    }
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        getCurrentUser: () => user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
