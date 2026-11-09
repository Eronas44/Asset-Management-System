import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';
import type { DashboardStats, DashboardAlerts } from '../../types/dashboard';
import type { AssetBorrowing } from '../../types/asset-borrowing';
import { formatRupiah } from '../../utils/format';
import { LoadingIndicator } from '../../components/Feedback/LoadingIndicator';
import { ErrorMessage } from '../../components/Feedback/ErrorMessage';
import { extractErrorMessage } from '../../utils/error';
import { 
  AlertCircle, CheckCircle2, TrendingUp, Monitor, 
  Briefcase, Wrench, ShieldOff, Clock, ShieldCheck,
  ChevronDown, ChevronUp, Sparkles, Activity, ArrowUpRight,
  Handshake
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, roles } = useAuth();

  // State Manajemen Data Dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlerts | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorDetails, setErrorDetails] = useState<{ message: string; traceId?: string } | null>(null);

  // State Telemetry Ticker Collapsible
  const [isAlertDetailOpen, setIsAlertDetailOpen] = useState(false);

  useEffect(() => {
    // Menjalankan dual request API secara paralel demi performa yang cepat
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getAlerts()
    ])
      .then(([statsData, alertsData]) => {
        setStats(statsData);
        setAlerts(alertsData);
      })
      .catch((err) => {
        const extracted = extractErrorMessage(err);
        setErrorDetails({ message: extracted.message, traceId: extracted.traceId });
      })
      .finally(() => setLoadingStats(false));
  }, []);

  if (loadingStats) return <LoadingIndicator message="Memperbarui matriks statistik & notifikasi sistem..." />;
  if (errorDetails) return <ErrorMessage message={errorDetails.message} traceId={errorDetails.traceId} />;

  const hasOverdue = alerts && alerts.overdue_borrowings > 0;

  return (
    <div className="space-y-6 font-sans text-[#0F172A] dark:text-slate-100 overflow-x-hidden">
      
      {/* =========================================================================
          EXECUTIVE HERO HEADER & LIVE TELEMETRY TICKER
      ========================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E0D8] pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              Pusat Kendali Eksekutif
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50/80 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-950/50 dark:text-[#34D399]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] dark:bg-[#34D399] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981] dark:bg-[#34D399]" />
              </span>
              REAL-TIME OVERVIEW
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Selamat datang, <span className="font-semibold text-[#0F172A] dark:text-slate-200">{user?.name || 'Administrator'}</span>. Hak otorisasi aktif:{' '}
            <span className="font-mono text-indigo-700 dark:text-[#6366F1]">[{roles.join(', ')}]</span>.
          </p>
        </div>

        {/* Quick Date & Spatial Stamp */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#111827]/80 dark:backdrop-blur-xl px-3 py-1.5 rounded-xl border border-[#E2E0D8] dark:border-white/10 shadow-xs">
          <Activity size={14} className="text-[#10B981] dark:text-[#34D399]" />
          <span>STATUS: ONLINE COMMAND ACTIVE</span>
        </div>
      </div>

      {/* =========================================================================
          LIVE TELEMETRY TICKER (Pill-shaped with Animated Pulsing Emerald/Cyber Mint Dot)
      ========================================================================= */}
      {alerts && (
        <section aria-label="Status Sirkulasi Operasional" className="transition-all">
          <div 
            className={`rounded-2xl border p-3 sm:px-4 sm:py-3 transition-all backdrop-blur-md ${
              hasOverdue 
                ? 'border-amber-500/30 bg-amber-50/80 text-amber-950 dark:border-amber-400/30 dark:bg-[#111827]/80 dark:text-amber-200 shadow-sm' 
                : 'border-[#E2E0D8] bg-white text-[#0F172A] dark:border-white/10 dark:bg-[#111827]/80 dark:text-emerald-300 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              
              {/* Telemetry Indicator & Headline */}
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3 shrink-0">
                  {hasOverdue ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                    </>
                  ) : (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] dark:bg-[#34D399] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981] dark:bg-[#34D399]" />
                    </>
                  )}
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {hasOverdue ? (
                    <AlertCircle size={15} className="text-amber-600 dark:text-amber-400" />
                  ) : (
                    <CheckCircle2 size={15} className="text-[#10B981] dark:text-[#34D399]" />
                  )}
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-slate-200">
                    {hasOverdue ? 'Pemberitahuan Audit: Peminjaman Terlambat' : 'Status Sirkulasi Operasional Aman'}
                  </h2>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    hasOverdue 
                      ? 'bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200' 
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-[#34D399]'
                  }`}>
                    {hasOverdue ? `${alerts.overdue_borrowings} Terlambat` : 'Live Telemetry: Normal'}
                  </span>
                </div>
              </div>

              {/* Collapsible Action Trigger */}
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                  {hasOverdue 
                    ? `Perhatian: ${alerts.overdue_borrowings} unit aset terdata belum dikembalikan sesuai batas waktu.` 
                    : 'Seluruh peminjaman aset inventaris berjalan sesuai jadwal operasional.'}
                </p>

                <button
                  type="button"
                  onClick={() => setIsAlertDetailOpen(!isAlertDetailOpen)}
                  className="min-h-[44px] sm:min-h-[32px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#F4F3EF] dark:bg-[#111827] border border-[#E2E0D8] dark:border-white/10 text-[#0F172A] dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-2xs transition-all cursor-pointer"
                  aria-expanded={isAlertDetailOpen}
                >
                  <span>{isAlertDetailOpen ? 'Sembunyikan' : 'Detail'}</span>
                  {isAlertDetailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* Collapsible Detail Text & Overdue Audit Table */}
            {isAlertDetailOpen && (
              <div className="mt-3.5 pt-3 border-t border-[#E2E0D8] dark:border-white/10 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                {hasOverdue ? (
                  <div>
                    <p className="mb-3 text-xs text-amber-900 dark:text-amber-200 font-medium">
                      Terdeteksi <strong className="font-bold underline underline-offset-2">{alerts.overdue_borrowings}</strong> unit aset melewati tanggal pengembalian yang disepakati:
                    </p>
                    
                    <div className="overflow-hidden rounded-xl border border-[#E2E0D8] bg-white dark:border-white/10 dark:bg-[#111827]/90 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-[#E2E0D8] bg-[#F4F3EF] text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:border-white/10 dark:bg-slate-850 dark:text-slate-400">
                            <tr>
                              <th className="px-3.5 py-2.5">Aset Inventaris</th>
                              <th className="px-3.5 py-2.5">Peminjam</th>
                              <th className="px-3.5 py-2.5">Batas Pengembalian</th>
                              <th className="px-3.5 py-2.5 text-rose-700 dark:text-rose-400">Keterlambatan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E0D8] dark:divide-white/10">
                            {alerts.overdue_assets.map((item: AssetBorrowing) => (
                              <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                                <td className="px-3.5 py-2.5">
                                  <div className="font-semibold text-[#0F172A] dark:text-slate-100">{item.asset?.name}</div>
                                  <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{item.asset?.asset_code}</div>
                                </td>
                                <td className="px-3.5 py-2.5 font-medium text-slate-700 dark:text-slate-200">{item.borrower_name}</td>
                                <td className="px-3.5 py-2.5 font-mono text-slate-600 dark:text-slate-300">{item.expected_return_at}</td>
                                <td className="px-3.5 py-2.5 font-mono font-bold text-rose-700 dark:text-rose-400">
                                  <div className="inline-flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{item.overdue_days} Hari</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-900 dark:text-[#34D399] leading-relaxed font-medium">
                    Seluruh peminjaman aset inventaris berjalan sesuai jadwal operasional. Tidak ada unit yang mengalami keterlambatan pengembalian.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          ASYMMETRICAL BENTO GRID COMMAND CENTER
          - Desktop: grid-cols-4
          - Tablet: grid-cols-2
          - Mobile Portrait: stacked hero & compact 2x3 bento sub-grid
      ========================================================================= */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* =====================================================================
              MODULE 1: SIGNATURE FINANCIAL VAULT BENTO MODULE (Spans 2 columns)
              - Signature dark mesh gradient: bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950
              - Glowing emerald badge accents in both Light and Dark modes
              - Responsive clamp() monospace typography for IDR
              - Subtle SVG depreciation curve background
          ===================================================================== */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 p-6 text-white shadow-2xl flex flex-col justify-between group">
            
            {/* Ambient Radial Mesh Gradient Glow Orbs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-[#10B981]/20 blur-3xl transition-opacity group-hover:bg-[#10B981]/30" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-[#4F46E5]/20 blur-3xl" />

            {/* Subtle SVG Depreciation Curve Background */}
            <div className="pointer-events-none absolute right-0 bottom-0 w-72 h-36 opacity-30 overflow-hidden">
              <svg 
                viewBox="0 0 280 140" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="deprecCurveArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="deprecLine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="50%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <path 
                  d="M 10 20 Q 90 25 150 70 T 270 120 L 270 140 L 10 140 Z" 
                  fill="url(#deprecCurveArea)" 
                />
                {/* Main Curve Line */}
                <path 
                  d="M 10 20 Q 90 25 150 70 T 270 120" 
                  stroke="url(#deprecLine)" 
                  strokeWidth="2.5" 
                  strokeDasharray="4 3" 
                />
                {/* Coordinate Markers */}
                <circle cx="10" cy="20" r="3.5" fill="#6366F1" />
                <circle cx="150" cy="70" r="3" fill="#34D399" />
                <circle cx="270" cy="120" r="3.5" fill="#10B981" />
                {/* Grid Line Baseline */}
                <line x1="0" y1="138" x2="280" y2="138" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
            </div>

            {/* Top Vault Badge & Audit Ready Status (Glowing in both Light & Dark modes) */}
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-[#34D399] border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                    <Sparkles size={14} />
                  </div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-200">
                    Total Nilai Buku Fiskal (Net Book Value)
                  </span>
                </div>

                {/* Signature Glowing Emerald Badge Accents in Both Modes */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-950/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#34D399] shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  Audit Ready
                </span>
              </div>

              {/* Value Monospace with Responsive clamp() */}
              <div className="mt-4">
                <div 
                  className="font-mono font-bold tracking-tight text-white drop-shadow-sm tabular-nums break-words leading-none"
                  style={{ fontSize: 'clamp(1.35rem, 3.8vw, 2.25rem)' }}
                >
                  {formatRupiah(stats.total_book_value)}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <span className="text-[#34D399] flex items-center gap-0.5">
                    <TrendingUp size={13} />
                    <span>Fiskal Aktif</span>
                  </span>
                  <span>•</span>
                  <span>Metode Garis Lurus (Straight-Line)</span>
                </div>
              </div>
            </div>

            {/* Footer Summary Info */}
            <div className="relative z-10 mt-6 pt-3 border-t border-white/10 text-xs text-slate-300 leading-relaxed flex items-center justify-between">
              <p className="line-clamp-2 max-w-sm">
                Akumulasi nilai buku ekonomis dari seluruh unit aktif setelah memperhitungkan depresiasi garis lurus tahun berjalan.
              </p>
              <Link
                to="/assets"
                className="hidden sm:inline-flex items-center gap-1 text-[#34D399] hover:text-emerald-200 font-mono text-[11px] font-semibold shrink-0"
              >
                <span>Audit Detail</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* =====================================================================
              MODULE 2: QUICK OPERATIONS COMMAND CENTER BENTO (Spans 2 columns)
              - Light Mode: Crisp white with 1px solid #E2E0D8
              - Dark Mode: Glassmorphic in #111827/80 with border-white/10
          ===================================================================== */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 rounded-3xl border border-[#E2E0D8] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]/80 dark:backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#10B981] dark:text-[#34D399]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-slate-100">
                    Pusat Operasional Cepat
                  </span>
                </div>
                <span className="rounded-full bg-[#F4F3EF] dark:bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                  Command Hub
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Akses cepat menuju modul sirkulasi aset, peninjauan barcode QR fisik, dan pemeliharaan berkala unit organisasi.
              </p>
            </div>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <Link
                to="/assets"
                className="min-h-[44px] flex items-center gap-2.5 p-3 rounded-2xl border border-[#E2E0D8] bg-[#F4F3EF]/60 hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all text-xs font-semibold text-[#0F172A] dark:text-slate-200"
              >
                <Monitor size={16} className="text-[#4F46E5] dark:text-[#6366F1]" />
                <span>Inventaris Aset</span>
              </Link>

              <Link
                to="/borrowings"
                className="min-h-[44px] flex items-center gap-2.5 p-3 rounded-2xl border border-[#E2E0D8] bg-[#F4F3EF]/60 hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all text-xs font-semibold text-[#0F172A] dark:text-slate-200"
              >
                <Handshake size={16} className="text-[#10B981] dark:text-[#34D399]" />
                <span>Sirkulasi Pinjam</span>
              </Link>

              <Link
                to="/categories"
                className="min-h-[44px] flex items-center gap-2.5 p-3 rounded-2xl border border-[#E2E0D8] bg-[#F4F3EF]/60 hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all text-xs font-semibold text-[#0F172A] dark:text-slate-200"
              >
                <Briefcase size={16} className="text-amber-500" />
                <span>Kategori Aset</span>
              </Link>

              <Link
                to="/activity-logs"
                className="min-h-[44px] flex items-center gap-2.5 p-3 rounded-2xl border border-[#E2E0D8] bg-[#F4F3EF]/60 hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all text-xs font-semibold text-[#0F172A] dark:text-slate-200"
              >
                <Clock size={16} className="text-indigo-500 dark:text-[#6366F1]" />
                <span>Log Aktivitas</span>
              </Link>
            </div>
          </div>

          {/* =====================================================================
              MODULE 3: COMPACT 2X3 BENTO SUB-GRID FOR 6 METRIC COUNTERS
              - Light Mode: Crisp White Cards with 1px solid #E2E0D8 borders
              - Dark Mode: Glassmorphic #111827/80 with border-white/10 & neon accents
          ===================================================================== */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Matriks Ledgers & Sirkulasi Unit
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                6 Metrik Operasional
              </span>
            </div>

            {/* Sub-grid container: 2 columns on mobile (2x3), 3 on tablet, 6 on extra-large */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">

              {/* 1. Total Aset */}
              <div className="rounded-2xl border border-[#E2E0D8] bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[#111827]/80 dark:backdrop-blur-xl transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Aset
                  </span>
                  <div className="rounded-xl border border-[#E2E0D8] bg-[#F4F3EF] p-1.5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <Monitor size={15} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0F172A] dark:text-white tabular-nums">
                    {stats.total_assets}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    Seluruh unit ledger
                  </p>
                </div>
              </div>

              {/* 2. Unit Tersedia */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20 shadow-xs transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-[#34D399]">
                    Unit Tersedia
                  </span>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-100/70 p-1.5 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-900/50 dark:text-[#34D399]">
                    <CheckCircle2 size={15} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-700 dark:text-[#34D399] tabular-nums">
                    {stats.available_assets}
                  </div>
                  <p className="mt-1 text-[10px] text-emerald-600/90 dark:text-emerald-400/80 truncate">
                    Siap dialokasikan
                  </p>
                </div>
              </div>

              {/* 3. Aset Dipinjam */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-950/20 shadow-xs transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    Aset Dipinjam
                  </span>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-100/70 p-1.5 text-amber-700 dark:border-amber-500/30 dark:bg-amber-900/50 dark:text-amber-300">
                    <Briefcase size={15} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-700 dark:text-amber-400 tabular-nums">
                    {stats.borrowed_assets}
                  </div>
                  <p className="mt-1 text-[10px] text-amber-600/90 dark:text-amber-400/80 truncate">
                    Pemakaian aktif
                  </p>
                </div>
              </div>

              {/* 4. Sirkulasi Berjalan */}
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-50/50 p-4 dark:border-indigo-500/20 dark:bg-indigo-950/20 shadow-xs transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1]">
                    Sirkulasi Berjalan
                  </span>
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-100/70 p-1.5 text-[#4F46E5] dark:border-indigo-500/30 dark:bg-indigo-900/50 dark:text-[#6366F1]">
                    <TrendingUp size={15} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#4F46E5] dark:text-[#6366F1] tabular-nums">
                    {stats.active_borrowings}
                  </div>
                  <p className="mt-1 text-[10px] text-indigo-600/80 dark:text-indigo-400/80 truncate">
                    Tiket belum tutup
                  </p>
                </div>
              </div>

              {/* 5. Perawatan */}
              <div className="rounded-2xl border border-[#E2E0D8] bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[#111827]/80 dark:backdrop-blur-xl transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Perawatan
                  </span>
                  <div className="rounded-xl border border-[#E2E0D8] bg-[#F4F3EF] p-1.5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <Wrench size={15} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0F172A] dark:text-slate-200 tabular-nums">
                    {stats.maintenance_assets}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    Servis berkala
                  </p>
                </div>
              </div>

              {/* 6. Pensiun / Dihapus */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-50/50 p-4 dark:border-rose-500/20 dark:bg-rose-950/20 shadow-xs transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                    Pensiun / Dihapus
                  </span>
                  <div className="rounded-xl border border-rose-500/30 bg-rose-100/70 p-1.5 text-rose-700 dark:border-rose-500/30 dark:bg-rose-900/50 dark:text-rose-300">
                    <ShieldOff size={15} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-700 dark:text-rose-400 tabular-nums">
                    {stats.retired_assets}
                  </div>
                  <p className="mt-1 text-[10px] text-rose-600/80 dark:text-rose-400/80 truncate">
                    Habis masa manfaat
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default DashboardPage;
