import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoadingIndicator } from '../components/Feedback/LoadingIndicator';
import ProtectedRoute from './ProtectedRoute';

// =========================================================================
// LAZY LOADING KOMPONEN HALAMAN
// =========================================================================
const LoginPage = lazy(() => import('../pages/Login/LoginPage'));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const CategoryPage = lazy(() => import('../pages/AssetCategories/CategoryPage'));
const LocationPage = lazy(() => import('../pages/AssetLocations/LocationPage'));
const AssetPage = lazy(() => import('../pages/Assets/AssetPage'));
const AssetDetailPage = lazy(() => import('../pages/AssetDetail/AssetDetailPage'));
const BorrowingPage = lazy(() => import('../pages/AssetBorrowings/BorrowingPage'));
const PublicAssetPage = lazy(() => import('../pages/PublicAssets/PublicAssetPage'));
const ForbiddenPage = lazy(() => import('../pages/Forbidden/ForbiddenPage'));
const ActivityLogPage = lazy(() => import('../pages/ActivityLogs/ActivityLogPage'));
const UserPage = lazy(() => import('../pages/Users/UserPage'));
const BackupPage = lazy(() => import('../pages/Backups/BackupPage'));
const GuidePage = lazy(() => import('../pages/Guide/GuidePage'));

// Helper untuk membungkus komponen dengan state loading saat proses unduh halaman berlangsung
const withSuspense = (component: React.ReactNode) => (
  <Suspense fallback={<LoadingIndicator message="Mempersiapkan halaman..." />}>
    {component}
  </Suspense>
);

// =========================================================================
// KONFIGURASI ROUTER UTAMA (VERSI LAZY)
// =========================================================================
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/forbidden',
    element: withSuspense(<ForbiddenPage />),
  },
  {
    path: '/public/assets/:uuid',
    element: withSuspense(<PublicAssetPage />),
  },
  
  // ==========================================
  // RUTE-RUTE TERPROTEKSI (LAZY LOADING)
  // ==========================================
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute permission="view-reports">
        {withSuspense(<DashboardPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/categories',
    element: (
      <ProtectedRoute permission="manage-master-data">
        {withSuspense(<CategoryPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/locations',
    element: (
      <ProtectedRoute permission="manage-master-data">
        {withSuspense(<LocationPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/assets',
    element: (
      <ProtectedRoute permission="manage-assets|manage-borrowings">
        {withSuspense(<AssetPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/assets/:id',
    element: (
      <ProtectedRoute permission="manage-assets|manage-borrowings">
        {withSuspense(<AssetDetailPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/borrowings',
    element: (
      <ProtectedRoute permission="manage-borrowings">
        {withSuspense(<BorrowingPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/activity-logs',
    element: (
      <ProtectedRoute permission="view-reports">
        {withSuspense(<ActivityLogPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute permission="manage-users">
        {withSuspense(<UserPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/backups',
    element: (
      <ProtectedRoute permission="manage-users">
        {withSuspense(<BackupPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/guide',
    element: (
      <ProtectedRoute layout="none">
        {withSuspense(<GuidePage />)}
      </ProtectedRoute>
    ),
  },
]);
