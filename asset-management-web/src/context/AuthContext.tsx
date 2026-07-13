import React, { createContext, useContext, useState, useEffect } from 'react';
import type{ User, UserProfileResponse } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  roles: string[];
  permissions: string[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

    const refreshProfile = async () => {
    // Pastikan fungsi ini dipanggil hanya jika token ada di lokal
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Gagal memuat profil hak akses:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    refreshProfile();
  }, []);

  // Sumber kebenaran tunggal untuk pengecekan hak akses di frontend
  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    return profile.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      user: profile?.user || null, 
      roles: profile?.roles || [], 
      permissions: profile?.permissions || [], 
      loading, 
      refreshProfile,
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
};
