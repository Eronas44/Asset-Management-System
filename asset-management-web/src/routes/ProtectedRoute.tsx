import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../utils/token';
import DashboardLayout from '../layouts/DashboardLayout';

interface ProtectedRouteProps {
  permission?: string;
  children: React.ReactElement;
  layout?: 'dashboard' | 'none';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission, children, layout = 'dashboard' }) => {
  const { hasPermission, loading } = useAuth();
  const token = getToken();

  // Tunggu hingga data profil keamanan selesai dimuat dari API
  if (loading) {
    return <div className="flex items-center justify-center h-screen w-full bg-gray-50 text-gray-500">Memeriksa hak akses...</div>;
  }

  // Skenario 1: Jika pengguna belum login, paksa kembali ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Skenario 2: Jika rute butuh permission khusus dan pengguna tidak memilikinya, lempar ke halaman 403
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Jika layout disetel none (misal dokumentasi/panduan dengan sidebar sendiri), render langsung
  if (layout === 'none') {
    return children;
  }

  // Jika lolos semua pengecekan, render halaman tujuan di dalam Layout Dashboard
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ProtectedRoute;
