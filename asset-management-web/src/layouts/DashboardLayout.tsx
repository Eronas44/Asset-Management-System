import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, ChevronLeft, ChevronRight, 
  LayoutDashboard, Users, Database, 
  Monitor, Handshake, ScrollText, 
  FolderOpen, MapPin, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, roles, hasPermission } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

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
      permission: 'manage-assets',
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
  ];

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-left text-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100">
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:relative
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Header Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
          <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition-opacity ${isDesktopCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              AM
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-white">AssetSystem</span>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="cursor-pointer rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info Profile */}
        <div className={`flex flex-col items-center justify-center border-b border-slate-100 bg-slate-50/70 p-4 transition-all dark:border-slate-800 dark:bg-slate-950/40 ${isDesktopCollapsed ? 'lg:p-2' : ''}`}>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isDesktopCollapsed && (
            <div className="text-center overflow-hidden whitespace-nowrap">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
              <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                {roles}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-500/15 dark:text-indigo-200' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-200'
                      }`}
                    title={isDesktopCollapsed ? item.title : ''}
                  >
                    <div className={`${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-300'}`}>
                      {item.icon}
                    </div>
                    <span className={`whitespace-nowrap transition-opacity duration-200 ${isDesktopCollapsed ? 'lg:opacity-0 lg:w-0 lg:hidden' : 'opacity-100'}`}>
                      {item.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer Sidebar (Logout) */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
            title={isDesktopCollapsed ? "Keluar" : ""}
          >
            <LogOut size={20} />
            <span className={`whitespace-nowrap transition-opacity ${isDesktopCollapsed ? 'lg:hidden' : ''}`}>
              Keluar
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/70 dark:bg-slate-950">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm/50 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="-ml-2 cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            {/* Desktop collapse button */}
            <button
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300 lg:flex"
            >
              {isDesktopCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <ThemeToggleButton />
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full text-left">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
