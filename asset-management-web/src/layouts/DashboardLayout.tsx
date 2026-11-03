import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, ChevronLeft, ChevronRight, 
  LayoutDashboard, Users, Database, 
  Monitor, Handshake, ScrollText, 
  FolderOpen, MapPin, LogOut, QrCode,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import { QrScannerModal } from '../components/Scanner/QrScannerModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, roles, hasPermission } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Menutup sidebar mobile ketika rute berubah
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      permission: 'view-reports',
    },
    {
      title: 'Kategori Aset',
      path: '/categories',
      icon: <FolderOpen size={20} />,
      permission: 'manage-master-data',
    },
    {
      title: 'Lokasi Aset',
      path: '/locations',
      icon: <MapPin size={20} />,
      permission: 'manage-master-data',
    },
    {
      title: 'Inventaris Aset',
      path: '/assets',
      icon: <Monitor size={20} />,
      permission: 'manage-assets|manage-borrowings',
    },
    {
      title: 'Peminjaman',
      path: '/borrowings',
      icon: <Handshake size={20} />,
      permission: 'manage-borrowings',
    },
    {
      title: 'Riwayat Aktivitas',
      path: '/activity-logs',
      icon: <ScrollText size={20} />,
      permission: 'view-reports',
    },
    {
      title: 'Kelola Pengguna',
      path: '/users',
      icon: <Users size={20} />,
      permission: 'manage-users',
    },
    {
      title: 'Backup & Restore',
      path: '/backups',
      icon: <Database size={20} />,
      permission: 'manage-users',
    },
    {
      title: 'Panduan Program',
      path: '/guide',
      icon: <BookOpen size={20} />,
      permission: undefined,
    },
  ];

  const filteredNavItems = navItems.filter(item => !item.permission || hasPermission(item.permission));

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-left text-slate-800 bg-slate-50/60 dark:bg-slate-950 dark:text-slate-100">
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-250 ease-in-out lg:relative
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isDesktopCollapsed ? 'lg:w-16' : 'lg:w-60'} w-60`}
      >
        {/* Header Sidebar */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200/80 px-3.5 dark:border-slate-800">
          <div className={`flex items-center gap-2.5 overflow-hidden whitespace-nowrap transition-opacity ${isDesktopCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 font-mono text-[11px] font-bold text-white tracking-wider dark:bg-slate-100 dark:text-slate-950">
              AM
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white leading-none">AssetSystem</span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">Corporate Edition</span>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info Profile */}
        <div className={`flex items-center gap-2.5 border-b border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40 ${isDesktopCollapsed ? 'lg:justify-center lg:p-2' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-slate-200 bg-white font-mono text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isDesktopCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
              <div className="mt-0.5 flex items-center">
                <span className="inline-block rounded border border-slate-200/80 bg-white px-1.5 py-0.2 font-mono text-[9px] font-medium uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  {Array.isArray(roles) ? roles[0] : roles || '-'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors duration-150 group
                      ${isActive 
                        ? 'bg-slate-900 text-white font-medium shadow-xs dark:bg-slate-100 dark:text-slate-950' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`}
                    title={isDesktopCollapsed ? item.title : ''}
                  >
                    <div className={`${isActive ? 'text-white dark:text-slate-950' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'}`}>
                      {React.cloneElement(item.icon, { size: 16 })}
                    </div>
                    <span className={`whitespace-nowrap transition-opacity duration-150 ${isDesktopCollapsed ? 'lg:opacity-0 lg:w-0 lg:hidden' : 'opacity-100'}`}>
                      {item.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer Sidebar (Logout) */}
        <div className="border-t border-slate-200/80 p-2.5 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
            title={isDesktopCollapsed ? "Keluar" : ""}
          >
            <LogOut size={15} />
            <span className={`whitespace-nowrap transition-opacity ${isDesktopCollapsed ? 'lg:hidden' : ''}`}>
              Keluar Sesi
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="-ml-1.5 cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu size={20} />
            </button>
            
            {/* Desktop collapse button */}
            <button
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              className="hidden h-7 w-7 cursor-pointer items-center justify-center rounded border border-slate-200 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 lg:flex"
              title={isDesktopCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
            >
              {isDesktopCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="font-medium text-slate-700 dark:text-slate-300">Sistem Manajemen Aset</span>
              <span>/</span>
              <span className="font-mono uppercase text-[10px] text-slate-400">Enterprise Edition</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrScannerOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              title="Pindai QR / Barcode Aset Fisik"
            >
              <QrCode size={15} className="text-slate-600 dark:text-slate-400" />
              <span className="hidden sm:inline">Pindai QR</span>
            </button>
            <ThemeToggleButton />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-7xl mx-auto h-full text-left">
            {children}
          </div>
        </div>

        {/* QR Scanner Modal Global */}
        <QrScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
        />
      </main>
    </div>
  );
};

export default DashboardLayout;
