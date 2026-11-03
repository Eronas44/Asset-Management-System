import React, { createContext, useContext, useState, useEffect } from 'react';
import type{ User, UserProfileResponse } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  roles: string[];
  permissions: string[];
  loading: boolean;
  refreshProfile: () => Promise<UserProfileResponse | null>;
  setAuthData: (data: { user: User; roles?: string[]; permissions?: string[] }) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuthData = (data: { user: User; roles?: string[]; permissions?: string[] }) => {
    setProfile({
      user: data.user,
      roles: data.roles || [],
      permissions: data.permissions || [],
    });
    setLoading(false);
  };

  const refreshProfile = async (): Promise<UserProfileResponse | null> => {
    // Pastikan fungsi ini dipanggil hanya jika token ada di lokal
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const data = await authService.getProfile();
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Gagal memuat profil hak akses:', err);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    refreshProfile();
  }, []);

  // Sumber kebenaran tunggal untuk pengecekan hak akses di frontend.
  // Mendukung sintaks OR dengan pipe, misal: "manage-assets|manage-borrowings"
  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    if (permission.includes('|')) {
      return permission.split('|').some((p) => profile.permissions.includes(p.trim()));
    }
    return profile.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      user: profile?.user || null, 
      roles: profile?.roles || [], 
      permissions: profile?.permissions || [], 
      loading, 
      refreshProfile,
      setAuthData,
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
