import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Database, 
  Monitor, Handshake, ScrollText, 
  FolderOpen, MapPin, LogOut, QrCode,
  BookOpen, Search, X, Grid,
  ChevronRight, Sparkles, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import { QrScannerModal } from '../components/Scanner/QrScannerModal';

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
  // Sisanya masuk ke Bottom Sheet
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
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-left text-[#0F172A] bg-[#F4F3EF] dark:bg-[#090D16] dark:text-slate-100 transition-colors duration-300">
      
      {/* =========================================================================
          TOP HUD BAR (Minimal Floating Header)
          - Warm Alabaster: bg-white/80 border-[#E2E0D8]
          - Deep Obsidian: dark:bg-[#111827]/80 dark:border-white/10 dark:backdrop-blur-xl
      ========================================================================= */}
      <header className="sticky top-0 z-30 flex h-14 max-lg:landscape:h-12 w-full items-center justify-between border-b border-[#E2E0D8] bg-white/80 px-3 backdrop-blur-xl transition-all dark:border-white/10 dark:bg-[#111827]/80 sm:px-6">
        
        {/* Left Side: Brand Logo & Command Center Badge */}
        <div className="flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            title="Spatial Bento Command Center"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F172A] to-slate-800 font-mono text-[11px] font-bold text-white shadow-xs dark:from-[#4F46E5] dark:to-[#10B981] dark:text-white transition-transform group-hover:scale-105">
              AM
            </div>
            <div className="hidden xs:flex flex-col">
              <span className="text-xs font-bold tracking-tight text-[#0F172A] dark:text-white leading-none">
                AssetSystem
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#10B981] dark:text-[#34D399] mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] dark:bg-[#34D399] animate-pulse inline-block" />
                Spatial Command
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Trigger (Ctrl+K) */}
        <div className="flex items-center">
          <button
            onClick={() => setIsSearchPaletteOpen(true)}
            className="flex min-h-[44px] sm:min-h-[38px] items-center gap-2.5 rounded-xl border border-[#E2E0D8] bg-[#F4F3EF]/80 px-3 py-1.5 text-xs text-slate-500 shadow-2xs transition-all hover:border-[#10B981] hover:bg-white hover:text-[#0F172A] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-slate-200"
            title="Buka Pencarian Cepat (Ctrl+K)"
            aria-label="Cari Cepat"
          >
            <Search size={15} className="text-[#4F46E5] dark:text-[#6366F1]" />
            <span className="hidden sm:inline font-medium text-slate-700 dark:text-slate-300">
              Pencarian Cepat...
            </span>
            <span className="inline sm:hidden font-medium text-slate-700 dark:text-slate-300">
              Cari
            </span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-[#E2E0D8] bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-white/10 dark:bg-[#111827] dark:text-slate-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Side: QR Scanner Shortcut, Theme Toggle & Profile Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Scanner button (Visible on Desktop / Tablet) */}
          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="hidden sm:inline-flex min-h-[44px] sm:min-h-[36px] cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-all hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-[#34D399] dark:hover:bg-emerald-900/50"
            title="Pindai QR / Barcode Aset"
            aria-label="Pindai QR"
          >
            <QrCode size={15} />
            <span className="hidden md:inline">Pindai QR</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggleButton />

          {/* Super Administrator Profile Badge & Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex min-h-[44px] sm:min-h-[38px] cursor-pointer items-center gap-2 rounded-xl border border-[#E2E0D8] bg-white p-1.5 sm:px-2.5 sm:py-1.5 shadow-2xs transition-all hover:border-[#10B981] dark:border-white/10 dark:bg-[#111827] dark:hover:border-white/20"
              aria-label="Profil Pengguna"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#0F172A] to-indigo-950 font-mono text-xs font-bold text-white shadow-2xs dark:from-[#4F46E5] dark:to-[#10B981]">
                {userInitial}
              </div>
              <div className="hidden text-left lg:block">
                <p className="max-w-[120px] truncate text-xs font-bold text-[#0F172A] dark:text-slate-100 leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1 text-[9px] font-mono text-[#10B981] dark:text-[#34D399]">
                  <Shield size={10} />
                  <span className="truncate uppercase font-medium">{roleLabel}</span>
                </div>
              </div>
            </button>

            {/* Profile Popover / Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E2E0D8] bg-white p-3 shadow-2xl backdrop-blur-xl z-50 dark:border-white/10 dark:bg-[#111827]/95 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-3 border-b border-[#E2E0D8] pb-3 dark:border-white/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] font-mono text-sm font-bold text-white dark:bg-gradient-to-tr dark:from-[#4F46E5] dark:to-[#10B981]">
                      {userInitial}
                    </div>
                    <div className="overflow-hidden">
                      <p className="truncate text-xs font-bold text-[#0F172A] dark:text-white">
                        {user?.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {user?.email || 'admin@assetsystem.corp'}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/60 dark:text-[#34D399]">
                        {roleLabel}
                      </span>
                    </div>
                  </div>

                  <div className="py-2 text-xs space-y-1">
                    <Link
                      to="/guide"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-slate-700 hover:bg-[#F4F3EF] dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen size={15} className="text-[#4F46E5] dark:text-[#6366F1]" />
                        Panduan & Bantuan
                      </span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </Link>
                  </div>

                  <div className="border-t border-[#E2E0D8] pt-2 dark:border-white/10">
                    <button
                      onClick={handleLogout}
                      className="flex w-full min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-50/80 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
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
          - Padding configured with safe-areas:
            * Portrait / Mobile / Desktop: pb-28
            * Landscape Mobile: pl-20 pb-6
          - overflow-x-hidden to prevent horizontal shift
      ========================================================================= */}
      <main className="min-h-[calc(100vh-3.5rem)] max-lg:landscape:min-h-[calc(100vh-3rem)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-32 sm:pb-36 max-lg:landscape:pl-20 max-lg:landscape:pb-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {/* =========================================================================
          1. DESKTOP FLOATING BOTTOM DOCK (lg: and up)
          - macOS style glassmorphism dock for all 9 routes
      ========================================================================= */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-1.5 p-2 rounded-2xl border border-[#E2E0D8] bg-white/90 dark:border-white/10 dark:bg-[#111827]/80 dark:backdrop-blur-xl shadow-[0_16px_40px_-8px_rgba(15,23,42,0.12)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)] transition-all">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative group flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 ${
                isActive
                  ? 'bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-md shadow-blue-500/25 dark:shadow-[0_0_15px_rgba(56,189,248,0.4)] font-semibold'
                  : 'text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-300 hover:bg-[#F4F3EF] dark:hover:bg-white/10'
              }`}
              aria-label={item.title}
            >
              {React.cloneElement(item.icon, { size: 19 })}
              
              {/* macOS style floating tooltip */}
              <div className="pointer-events-none absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom duration-150 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white dark:bg-[#111827] dark:text-slate-100 text-[11px] font-medium whitespace-nowrap shadow-xl border border-slate-700/50 dark:border-white/15">
                {item.title}
              </div>

              {/* Active Dot Indicator */}
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-blue-600 dark:bg-sky-400" />
              )}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="h-6 w-px bg-[#E2E0D8] dark:bg-white/10 mx-1" />

        {/* Action Button: QR Scanner */}
        <button
          onClick={() => setIsQrScannerOpen(true)}
          className="relative group flex flex-col items-center justify-center p-2.5 rounded-xl text-[#10B981] dark:text-[#34D399] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
          aria-label="Pindai QR"
          title="Pindai QR"
        >
          <QrCode size={19} />
          <div className="pointer-events-none absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom duration-150 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-200 text-[11px] font-medium whitespace-nowrap shadow-xl border border-emerald-500/30">
            Pindai QR
          </div>
        </button>
      </div>

      {/* =========================================================================
          2. MOBILE PORTRAIT FLOATING PILL BAR (< lg, portrait mode)
          - 4 primary routes
          - Elevated center action button for QrScannerModal ('Pindai QR')
          - 'More' trigger for the remaining routes bottom sheet
      ========================================================================= */}
      <nav 
        className="fixed bottom-4 inset-x-3 max-w-md mx-auto z-40 flex lg:hidden landscape:hidden items-center justify-between px-3 py-2 rounded-2xl border border-[#E2E0D8] bg-white/95 dark:border-white/10 dark:bg-[#111827]/85 backdrop-blur-xl shadow-[0_14px_35px_-5px_rgba(15,23,42,0.18)] dark:shadow-[0_14px_35px_-5px_rgba(0,0,0,0.7)]"
        aria-label="Navigasi Bergerak"
      >
        {/* Left Side: 2 Primary Routes (Dashboard, Inventaris Aset) */}
        {primaryMobileItems.slice(0, 2).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl p-1 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-sky-400/15' : ''}`}>
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
            className="group flex h-14 w-14 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-[0_10px_25px_rgba(16,185,129,0.5)] ring-4 ring-[#F4F3EF] dark:ring-[#090D16] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Pindai QR"
            title="Pindai QR Aset"
          >
            <QrCode size={24} className="transition-transform group-hover:rotate-12" />
          </button>
          <span className="mt-1 text-[10px] font-bold text-[#10B981] dark:text-[#34D399]">
            Pindai QR
          </span>
        </div>

        {/* Right Side: 1 Primary Route (Peminjaman) & 'More' Trigger */}
        {primaryMobileItems.slice(2, 3).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl p-1 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-sky-400/15' : ''}`}>
                {React.cloneElement(item.icon, { size: 20 })}
              </div>
              <span className="text-[10px] tracking-tight">{item.title.split(' ')[0]}</span>
            </Link>
          );
        })}

        {/* 'More' Trigger Button */}
        <button
          onClick={() => setIsMobileSheetOpen(true)}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl p-1 transition-colors cursor-pointer ${
            isMobileSheetOpen
              ? 'text-blue-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-slate-200'
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
          3. SLIDE-UP GLASSMORPHIC BOTTOM SHEET
          - Displays remaining routes and controls on Mobile Portrait
      ========================================================================= */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden landscape:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#090D16]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSheetOpen(false)}
          />

          {/* Bottom Sheet Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-[#E2E0D8] bg-white/95 p-5 pb-8 backdrop-blur-2xl shadow-2xl dark:border-white/10 dark:bg-[#111827]/95 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Grab Handle */}
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700 mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E0D8] dark:border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#10B981] dark:text-[#34D399]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Navigasi & Kendali Sistem
                </h3>
              </div>
              <button 
                onClick={() => setIsMobileSheetOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:bg-[#F4F3EF] hover:text-[#0F172A] dark:hover:bg-white/10"
                aria-label="Tutup Menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Remaining Routes Grid */}
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
                        ? 'border-blue-600 bg-blue-600 text-white dark:border-sky-400 dark:bg-sky-400 dark:text-slate-950 shadow-sm font-semibold'
                        : 'border-[#E2E0D8] bg-[#F4F3EF]/60 hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className={isActive ? 'text-white dark:text-slate-950' : 'text-blue-600 dark:text-sky-400'}>
                      {React.cloneElement(item.icon, { size: 18 })}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-semibold truncate leading-tight">{item.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.category}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* User Session Bar */}
            <div className="mt-2 border-t border-[#E2E0D8] pt-4 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] font-mono text-xs font-bold text-white dark:bg-gradient-to-tr dark:from-[#4F46E5] dark:to-[#10B981]">
                  {userInitial}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-slate-200">{user?.name}</p>
                  <p className="text-[10px] font-mono text-[#10B981] dark:text-[#34D399] uppercase">{roleLabel}</p>
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
          - Automatically shifts bottom dock into a compact vertical floating icon rail on left edge (w-14)
      ========================================================================= */}
      <aside 
        className="fixed left-3 top-1/2 -translate-y-1/2 z-40 hidden max-lg:landscape:flex flex-col items-center w-14 py-3 rounded-2xl border border-[#E2E0D8] bg-white/90 dark:border-white/10 dark:bg-[#111827]/85 backdrop-blur-xl shadow-2xl gap-2 max-h-[92vh] overflow-y-auto"
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
                  ? 'bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-md font-semibold'
                  : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-300 hover:bg-[#F4F3EF] dark:hover:bg-white/10'
              }`}
              title={item.title}
            >
              {React.cloneElement(item.icon, { size: 18 })}
            </Link>
          );
        })}

        {/* QR Scanner trigger on Rail */}
        <button
          onClick={() => setIsQrScannerOpen(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl p-2 text-[#10B981] hover:bg-emerald-50 dark:text-[#34D399] dark:hover:bg-emerald-950/50 cursor-pointer"
          title="Pindai QR"
          aria-label="Pindai QR"
        >
          <QrCode size={18} />
        </button>
      </aside>

      {/* =========================================================================
          5. COMMAND CENTER SEARCH PALETTE (Ctrl+K Modal)
      ========================================================================= */}
      {isSearchPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#090D16]/60 backdrop-blur-sm"
            onClick={() => setIsSearchPaletteOpen(false)}
          />

          {/* Palette Dialog */}
          <div className="relative w-full max-w-xl rounded-2xl border border-[#E2E0D8] bg-white p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#111827]/95 animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="flex items-center gap-2.5 border-b border-[#E2E0D8] pb-3 dark:border-white/10">
              <Search size={18} className="text-[#4F46E5] dark:text-[#6366F1]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik tujuan navigasi atau perintah..."
                className="w-full bg-transparent text-sm font-medium text-[#0F172A] outline-none placeholder:text-slate-400 dark:text-white"
                autoFocus
              />
              <button 
                onClick={() => setIsSearchPaletteOpen(false)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Actions & Navigation List */}
            <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
              <p className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Tujuan Navigasi
              </p>
              {filteredSearchItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Tidak ada tujuan navigasi yang sesuai dengan "{searchQuery}"
                </div>
              ) : (
                filteredSearchItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsSearchPaletteOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-[#0F172A] hover:bg-[#F4F3EF] dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-slate-400">{React.cloneElement(item.icon, { size: 16 })}</div>
                      <span className="font-semibold">{item.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{item.category}</span>
                  </button>
                ))
              )}

              {/* Quick Actions */}
              <p className="mt-3 px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 border-t border-[#E2E0D8] dark:border-white/10 pt-2">
                Aksi Cepat
              </p>
              <button
                onClick={() => {
                  setIsSearchPaletteOpen(false);
                  setIsQrScannerOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-[#10B981] hover:bg-emerald-50 dark:text-[#34D399] dark:hover:bg-emerald-950/40 cursor-pointer"
              >
                <QrCode size={16} />
                <span className="font-semibold">Buka Pindai QR Aset</span>
              </button>
            </div>

            {/* Footer Shortcut Info */}
            <div className="mt-3 flex items-center justify-between border-t border-[#E2E0D8] pt-2 text-[10px] text-slate-400 dark:border-white/10 font-mono">
              <span>Gunakan ESC untuk menutup</span>
              <span className="text-[#10B981] dark:text-[#34D399]">Spatial Command Center</span>
            </div>
          </div>
        </div>
      )}

      {/* Global QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
