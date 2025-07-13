import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, authService } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  user_type: 'student' | 'regular' | 'mess_owner';
  is_tiffin_user: boolean;
  is_mess_user: boolean;
  status: 'unverified' | 'registration_complete' | 'profile_complete';
  preferred_delivery_time?: string;
  student_profile?: any;
  regular_profile?: any;
  mess_owner_profile?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (username: string, password: string) => {
    try {
      await authService.login({ username, password });
      await refreshUser();
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data);
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      console.error('Error details:', error.response?.data);
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log('User profile not found or incomplete - might need OTP verification');
        return;
      }
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          await refreshUser();
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}