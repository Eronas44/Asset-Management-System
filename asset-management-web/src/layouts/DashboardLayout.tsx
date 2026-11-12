import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Database, 
  Monitor, Handshake, ScrollText, 
  FolderOpen, MapPin, LogOut, QrCode,
  BookOpen, Search, X, Grid,
  ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';

const QrScannerModal = React.lazy(() => 
  import('../components/Scanner/QrScannerModal').then(m => ({ default: m.QrScannerModal }))
);

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, roles, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isSearchPaletteOpen, setIsSearchPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Tutup menu mobile ketika navigasi berpindah
  useEffect(() => {
    setIsMobileSheetOpen(false);
    setIsProfileMenuOpen(false);
    setIsSearchPaletteOpen(false);
  }, [location.pathname]);

  // Listener untuk keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchPaletteOpen(false);
        setIsMobileSheetOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      permission: 'view-reports',
      category: 'Utama',
    },
    {
      title: 'Kategori Aset',
      path: '/categories',
      icon: <FolderOpen size={20} />,
      permission: 'manage-master-data',
      category: 'Master Data',
    },
    {
      title: 'Lokasi Aset',
      path: '/locations',
      icon: <MapPin size={20} />,
      permission: 'manage-master-data',
      category: 'Master Data',
    },
    {
      title: 'Inventaris Aset',
      path: '/assets',
      icon: <Monitor size={20} />,
      permission: 'manage-assets|manage-borrowings',
      category: 'Aset',
    },
    {
      title: 'Peminjaman',
      path: '/borrowings',
      icon: <Handshake size={20} />,
      permission: 'manage-borrowings',
      category: 'Sirkulasi',
    },
    {
      title: 'Riwayat Aktivitas',
      path: '/activity-logs',
      icon: <ScrollText size={20} />,
      permission: 'view-reports',
      category: 'Audit & Laporan',
    },
    {
      title: 'Kelola Pengguna',
      path: '/users',
      icon: <Users size={20} />,
      permission: 'manage-users',
      category: 'Administrasi',
    },
    {
      title: 'Backup & Restore',
      path: '/backups',
      icon: <Database size={20} />,
      permission: 'manage-users',
      category: 'Administrasi',
    },
    {
      title: 'Panduan Program',
      path: '/guide',
      icon: <BookOpen size={20} />,
      permission: undefined,
      category: 'Bantuan',
    },
  ];

  const filteredNavItems = navItems.filter(item => !item.permission || hasPermission(item.permission));

  // 4 Navigasi Utama untuk Tampilan Mobile Portrait
  const primaryMobilePaths = ['/dashboard', '/assets', '/borrowings', '/categories'];
  const primaryMobileItems = filteredNavItems.filter(item => primaryMobilePaths.includes(item.path));
  const sheetItems = filteredNavItems.filter(item => !primaryMobilePaths.includes(item.path));

  // Filter untuk Command Palette (Ctrl+K)
  const filteredSearchItems = filteredNavItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    authService.logout();
  };

  const roleLabel = Array.isArray(roles) && roles.length > 0 ? roles[0] : (roles || 'Pengguna');
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'A';

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-left text-slate-700 bg-[#FAF7F2] dark:bg-[#111822] dark:text-[#FAF7F2] transition-colors duration-200">
      
      {/* =========================================================================
          TOP HUD BAR (Warm Editorial Header)
      ========================================================================= */}
      <header className="sticky top-0 z-30 flex h-14 max-lg:landscape:h-12 w-full items-center justify-between border-b border-[#E6E1D6] bg-white/90 px-4 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-[#1A2433]/90 sm:px-6">
        
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A5F] text-[#FAF7F2] font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
              AM
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#2B4C6F] dark:text-[#FAF7F2]">
                Asset Management System
              </span>
              <span className="hidden sm:inline-flex bg-[#F4B752] text-[#1E293B] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Perusahaan
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Search Action Trigger (Ctrl+K) */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => setIsSearchPaletteOpen(true)}
            className="flex items-center gap-3 rounded-xl border border-[#E6E1D6] bg-[#FAF7F2] px-3.5 py-1.5 text-xs text-slate-500 shadow-2xs transition-all hover:border-[#1E3A5F] hover:bg-white dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300 dark:hover:border-slate-600 cursor-pointer w-64 justify-between"
            aria-label="Cari Cepat"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-[#2B4C6F] dark:text-[#F4B752]" />
              <span>Cari navigasi atau menu...</span>
            </div>
            <kbd className="rounded border border-[#E6E1D6] bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-[#1A2433] dark:text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Side: Quick Action Scanner, Theme Toggle, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Search on Mobile */}
          <button
            onClick={() => setIsSearchPaletteOpen(true)}
            className="flex md:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-[#FAF7F2] dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Pencarian"
          >
            <Search size={18} />
          </button>

          {/* Theme Toggle Button */}
          <ThemeToggleButton />

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="min-h-[44px] flex items-center gap-2.5 rounded-xl border border-[#E6E1D6] bg-white px-3 py-1.5 text-xs transition-all hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#1A2433] dark:hover:bg-slate-800 cursor-pointer"
              aria-expanded={isProfileMenuOpen}
              aria-label="Menu Pengguna"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F] font-mono text-xs font-bold text-[#FAF7F2]">
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="truncate text-xs font-bold text-[#2B4C6F] dark:text-[#FAF7F2] max-w-[120px]">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 capitalize">
                  {roleLabel}
                </p>
              </div>
            </button>

            {/* Profile Popover / Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E6E1D6] bg-white p-4 shadow-xl z-50 dark:border-slate-700 dark:bg-[#1A2433] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-3 border-b border-[#E6E1D6] pb-3 dark:border-slate-800">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E3A5F] font-mono text-sm font-bold text-[#FAF7F2]">
                      {userInitial}
                    </div>
                    <div className="overflow-hidden">
                      <p className="truncate text-xs font-bold text-[#2B4C6F] dark:text-[#FAF7F2]">
                        {user?.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {user?.email || 'admin@assetsystem.corp'}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded bg-[#F4B752] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1E293B]">
                        {roleLabel}
                      </span>
                    </div>
                  </div>

                  <div className="py-2 text-xs space-y-1">
                    <Link
                      to="/guide"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-slate-700 hover:bg-[#FAF7F2] dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen size={15} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                        Panduan & Bantuan
                      </span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </Link>
                  </div>

                  <div className="border-t border-[#E6E1D6] pt-2 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="flex w-full min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-50 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
                    >
                      <LogOut size={15} />
                      <span>Keluar Sesi</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN PAGE CONTENT AREA
      ========================================================================= */}
      <main className="min-h-[calc(100vh-3.5rem)] max-lg:landscape:min-h-[calc(100vh-3rem)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-32 sm:pb-36 max-lg:landscape:pl-20 max-lg:landscape:pb-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {/* =========================================================================
          1. DESKTOP FLOATING BOTTOM DOCK (lg: and up)
          - Solid Estate Navy (#1E3A5F) container
          - Warm cream icons (#FAF7F2)
          - Marigold (#F4B752) active indicator dot
      ========================================================================= */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-1.5 p-2 rounded-2xl border border-[#2B4C6F]/50 bg-[#1E3A5F] text-[#FAF7F2] shadow-xl transition-all">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative group flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 ${
                isActive
                  ? 'bg-white/15 text-[#FAF7F2] font-semibold'
                  : 'text-[#FAF7F2]/75 hover:text-[#FAF7F2] hover:bg-white/10'
              }`}
              aria-label={item.title}
            >
              {React.cloneElement(item.icon, { size: 19 })}
              
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom duration-150 px-2.5 py-1 rounded-lg bg-slate-900 text-[#FAF7F2] text-[11px] font-medium whitespace-nowrap shadow-md border border-slate-700/50">
                {item.title}
              </div>

              {/* Marigold Active Dot Indicator */}
              {isActive && (
                <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-[#F4B752]" />
              )}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="h-6 w-px bg-white/20 mx-1" />

        {/* Action Button: QR Scanner */}
        <button
          onClick={() => setIsQrScannerOpen(true)}
          className="relative group flex flex-col items-center justify-center p-2.5 rounded-xl text-[#F4B752] hover:bg-white/10 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
          aria-label="Pindai QR"
          title="Pindai QR"
        >
          <QrCode size={19} />
          <div className="pointer-events-none absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom duration-150 px-2.5 py-1 rounded-lg bg-slate-900 text-[#F4B752] text-[11px] font-medium whitespace-nowrap shadow-md border border-slate-700/50">
            Pindai QR
          </div>
        </button>
      </div>

      {/* =========================================================================
          2. MOBILE PORTRAIT FLOATING PILL BAR (< lg, portrait mode)
          - Solid Estate Navy (#1E3A5F)
          - Warm cream icons & Marigold elevated QR button
      ========================================================================= */}
      <nav 
        className="fixed bottom-4 inset-x-3 max-w-md mx-auto z-40 flex lg:hidden landscape:hidden items-center justify-between px-3 py-2 rounded-2xl border border-[#2B4C6F]/50 bg-[#1E3A5F] text-[#FAF7F2] shadow-xl"
        aria-label="Navigasi Bergerak"
      >
        {/* Left Side: 2 Primary Routes */}
        {primaryMobileItems.slice(0, 2).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl p-1 transition-colors ${
                isActive
                  ? 'text-[#F4B752] font-bold'
                  : 'text-[#FAF7F2]/75 hover:text-[#FAF7F2]'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-white/10' : ''}`}>
                {React.cloneElement(item.icon, { size: 20 })}
              </div>
              <span className="text-[10px] tracking-tight">{item.title.split(' ')[0]}</span>
            </Link>
          );
        })}

        {/* Center: Prominent Elevated Action Button for QR Scanner */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="group flex h-14 w-14 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#F4B752] text-slate-900 shadow-md ring-4 ring-[#FAF7F2] dark:ring-[#111822] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Pindai QR"
            title="Pindai QR Aset"
          >
            <QrCode size={24} className="transition-transform group-hover:rotate-6" />
          </button>
          <span className="mt-1 text-[10px] font-bold text-[#F4B752]">
            Pindai QR
          </span>
        </div>

        {/* Right Side: 1 Primary Route & 'Lainnya' Trigger */}
        {primaryMobileItems.slice(2, 3).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl p-1 transition-colors ${
                isActive
                  ? 'text-[#F4B752] font-bold'
                  : 'text-[#FAF7F2]/75 hover:text-[#FAF7F2]'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-white/10' : ''}`}>
                {React.cloneElement(item.icon, { size: 20 })}
              </div>
              <span className="text-[10px] tracking-tight">{item.title.split(' ')[0]}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setIsMobileSheetOpen(true)}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl p-1 transition-colors cursor-pointer ${
            isMobileSheetOpen
              ? 'text-[#F4B752] font-bold'
              : 'text-[#FAF7F2]/75 hover:text-[#FAF7F2]'
          }`}
          aria-label="Menu Lainnya"
        >
          <div className="p-1 rounded-lg">
            <Grid size={20} />
          </div>
          <span className="text-[10px] tracking-tight">Lainnya</span>
        </button>
      </nav>

      {/* =========================================================================
          3. SLIDE-UP TACTILE BOTTOM SHEET
      ========================================================================= */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden landscape:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSheetOpen(false)}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-[#E6E1D6] bg-white p-5 pb-8 shadow-2xl dark:border-slate-800 dark:bg-[#1A2433] max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700 mb-5" />

            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D6] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                <h3 className="text-sm font-bold text-[#2B4C6F] dark:text-white">
                  Navigasi Menu Lengkap
                </h3>
              </div>
              <button 
                onClick={() => setIsMobileSheetOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:bg-[#FAF7F2] hover:text-slate-800 dark:hover:bg-slate-800"
                aria-label="Tutup Menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-4">
              {sheetItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileSheetOpen(false)}
                    className={`min-h-[48px] flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white shadow-xs font-semibold dark:border-[#F4B752] dark:bg-[#F4B752] dark:text-slate-900'
                        : 'border-[#E6E1D6] bg-[#FAF7F2] hover:bg-white dark:border-slate-800 dark:bg-[#111822] dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={isActive ? 'text-inherit' : 'text-[#1E3A5F] dark:text-[#F4B752]'}>
                      {React.cloneElement(item.icon, { size: 18 })}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-semibold truncate leading-tight">{item.title}</p>
                      <p className="text-[10px] opacity-75 truncate">{item.category}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-2 border-t border-[#E6E1D6] pt-4 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A5F] font-mono text-xs font-bold text-[#FAF7F2]">
                  {userInitial}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2B4C6F] dark:text-slate-200">{user?.name}</p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">{roleLabel}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MOBILE LANDSCAPE VERTICAL ICON RAIL (max-lg:landscape)
          - Solid Estate Navy (#1E3A5F) vertical rail
      ========================================================================= */}
      <aside 
        className="fixed left-3 top-1/2 -translate-y-1/2 z-40 hidden max-lg:landscape:flex flex-col items-center w-14 py-3 rounded-2xl border border-[#2B4C6F]/50 bg-[#1E3A5F] text-[#FAF7F2] shadow-xl gap-2 max-h-[92vh] overflow-y-auto"
        aria-label="Navigasi Lanskap"
      >
        {filteredNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl p-2 transition-all ${
                isActive
                  ? 'bg-white/20 text-[#F4B752] font-semibold'
                  : 'text-[#FAF7F2]/75 hover:text-white hover:bg-white/10'
              }`}
              title={item.title}
            >
              {React.cloneElement(item.icon, { size: 18 })}
            </Link>
          );
        })}

        <button
          onClick={() => setIsQrScannerOpen(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl p-2 text-[#F4B752] hover:bg-white/10 cursor-pointer"
          title="Pindai QR"
          aria-label="Pindai QR"
        >
          <QrCode size={18} />
        </button>
      </aside>

      {/* =========================================================================
          5. COMMAND SEARCH PALETTE MODAL (Ctrl+K)
      ========================================================================= */}
      {isSearchPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsSearchPaletteOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-[#E6E1D6] bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-[#1A2433] z-10">
            <div className="flex items-center gap-2.5 px-3 py-2 border-b border-[#E6E1D6] dark:border-slate-800">
              <Search size={18} className="text-[#1E3A5F] dark:text-[#F4B752]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama menu navigasi..."
                className="w-full bg-transparent text-sm text-[#2B4C6F] dark:text-white placeholder:text-slate-400 outline-none"
                autoFocus
              />
              <button 
                onClick={() => setIsSearchPaletteOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-[#FAF7F2] dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-2 max-h-72 overflow-y-auto space-y-1">
              {filteredSearchItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Tidak ditemukan menu yang sesuai.
                </div>
              ) : (
                filteredSearchItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsSearchPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-[#FAF7F2] dark:hover:bg-[#111822] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-[#1E3A5F] dark:text-[#F4B752]">
                        {React.cloneElement(item.icon, { size: 16 })}
                      </div>
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-400">{item.category}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal Global (Lazy Loaded on Demand) */}
      {isQrScannerOpen && (
        <React.Suspense fallback={null}>
          <QrScannerModal
            isOpen={isQrScannerOpen}
            onClose={() => setIsQrScannerOpen(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default DashboardLayout;
