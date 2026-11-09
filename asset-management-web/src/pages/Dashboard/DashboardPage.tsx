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
  ChevronDown, ChevronUp, ArrowUpRight, Handshake
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, roles } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlerts | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorDetails, setErrorDetails] = useState<{ message: string; traceId?: string } | null>(null);
  const [isAlertDetailOpen, setIsAlertDetailOpen] = useState(false);

  useEffect(() => {
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
    <div className="space-y-6 font-sans text-slate-700 dark:text-[#FAF7F2] overflow-x-hidden">
      
      {/* =========================================================================
          EDITORIAL HEADER
      ========================================================================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E6E1D6] pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B4C6F] dark:text-[#FAF7F2]">
              Pusat Kendali Eksekutif
            </h1>
            <span className="bg-[#F4B752] text-[#1E293B] font-semibold px-3 py-1 rounded-full text-xs shadow-2xs">
              Ringkasan Operasional
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Selamat datang, <span className="font-semibold text-[#1E3A5F] dark:text-slate-200">{user?.name || 'Administrator'}</span>. Hak wewenang aktif:{' '}
            <span className="font-mono text-[#2B4C6F] dark:text-[#F4B752]">[{roles.join(', ')}]</span>.
          </p>
        </div>

        {/* Clean Date / Facility Stamp */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#1A2433] px-3.5 py-2 rounded-xl border border-[#E6E1D6] dark:border-slate-800 shadow-xs">
          <ShieldCheck size={15} className="text-[#1E3A5F] dark:text-[#F4B752]" />
          <span>Sistem Aktif & Terverifikasi</span>
        </div>
      </div>

      {/* =========================================================================
          STATUS SIRKULASI OPERASIONAL (Clean Notification Card)
      ========================================================================= */}
      {alerts && (
        <section aria-label="Status Sirkulasi Operasional">
          <div 
            className={`rounded-xl border p-4 transition-all shadow-xs ${
              hasOverdue 
                ? 'border-amber-300 bg-amber-50/80 text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/20 dark:text-amber-200' 
                : 'border-[#E6E1D6] bg-white text-slate-700 dark:border-slate-800 dark:bg-[#1A2433] dark:text-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${hasOverdue ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'}`}>
                  {hasOverdue ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B4C6F] dark:text-slate-100">
                      {hasOverdue ? 'Pemberitahuan: Unit Melewati Batas Waktu' : 'Status Sirkulasi Operasional Aman'}
                    </h2>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      hasOverdue 
                        ? 'bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200' 
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}>
                      {hasOverdue ? `${alerts.overdue_borrowings} Terlambat` : 'Normal'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {hasOverdue 
                      ? `${alerts.overdue_borrowings} unit aset terdata belum dikembalikan sesuai batas waktu yang disepakati.` 
                      : 'Seluruh sirkulasi peminjaman aset berjalan sesuai jadwal operasional.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAlertDetailOpen(!isAlertDetailOpen)}
                className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF7F2] dark:bg-[#111822] border border-[#E6E1D6] dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
                aria-expanded={isAlertDetailOpen}
              >
                <span>{isAlertDetailOpen ? 'Sembunyikan' : 'Lihat Detail'}</span>
                {isAlertDetailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Collapsible Detail Table */}
            {isAlertDetailOpen && (
              <div className="mt-4 pt-3 border-t border-[#E6E1D6] dark:border-slate-700/60 text-xs animate-in fade-in duration-150">
                {hasOverdue ? (
                  <div className="overflow-hidden rounded-lg border border-[#E6E1D6] bg-white dark:border-slate-700 dark:bg-[#111822]">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#E6E1D6] bg-[#F4F0EA] text-[11px] font-semibold uppercase tracking-wider text-[#2B4C6F] dark:border-slate-700 dark:bg-[#151D2A] dark:text-[#E2DCD5]">
                        <tr>
                          <th className="px-4 py-2.5">Aset Inventaris</th>
                          <th className="px-4 py-2.5">Peminjam</th>
                          <th className="px-4 py-2.5">Batas Pengembalian</th>
                          <th className="px-4 py-2.5 text-rose-700 dark:text-rose-400">Keterlambatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFECE6] dark:divide-slate-800">
                        {alerts.overdue_assets.map((item: AssetBorrowing) => (
                          <tr key={item.id} className="hover:bg-[#FAF7F2]/80 dark:hover:bg-[#1A2433]">
                            <td className="px-4 py-2.5">
                              <div className="font-semibold text-[#1E3A5F] dark:text-slate-100">{item.asset?.name}</div>
                              <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{item.asset?.asset_code}</div>
                            </td>
                            <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{item.borrower_name}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-300">{item.expected_return_at}</td>
                            <td className="px-4 py-2.5 font-mono font-bold text-rose-700 dark:text-rose-400">
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
                ) : (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    Seluruh peminjaman aset inventaris berjalan sesuai jadwal operasional. Tidak ada unit yang mengalami keterlambatan pengembalian.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          HERO BLOCKS & METRICS BENTO GRID
      ========================================================================= */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* MODULE 1: TOTAL NILAI BUKU FISKAL (Solid Estate Navy block) */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 rounded-xl bg-[#1E3A5F] text-[#FAF7F2] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]/80">
                  Total Nilai Buku Fiskal (Net Book Value)
                </span>
                
                {/* Solid Marigold 'Audit Ready' Pill Badge */}
                <span className="bg-[#F4B752] text-[#1E293B] font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider">
                  Audit Ready
                </span>
              </div>

              {/* Monospace Financial Value */}
              <div className="mt-4">
                <div 
                  className="font-mono font-bold tracking-tight text-[#FAF7F2] tabular-nums break-words leading-none"
                  style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
                >
                  {formatRupiah(stats.total_book_value)}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-[#FAF7F2]/80 font-mono">
                  <span className="text-[#F4B752] flex items-center gap-1 font-semibold">
                    <TrendingUp size={13} />
                    <span>Fiskal Aktif</span>
                  </span>
                  <span>•</span>
                  <span>Metode Garis Lurus (Straight-Line)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 text-xs text-[#FAF7F2]/75 flex items-center justify-between">
              <p className="line-clamp-2 max-w-sm">
                Akumulasi nilai buku ekonomis dari seluruh unit aktif setelah memperhitungkan depresiasi garis lurus tahun berjalan.
              </p>
              <Link
                to="/assets"
                className="inline-flex items-center gap-1 text-[#F4B752] hover:text-[#f8c97e] font-semibold text-xs shrink-0"
              >
                <span>Audit Detail</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* MODULE 2: PUSAT OPERASIONAL CEPAT */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 rounded-xl border border-[#E6E1D6] bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#1A2433] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#1E3A5F] dark:bg-[#111822] dark:text-[#F4B752]">
                    <ShieldCheck size={18} />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B4C6F] dark:text-[#FAF7F2]">
                    Pusat Operasional Cepat
                  </h2>
                </div>
                <span className="rounded-full bg-[#FAF7F2] dark:bg-[#111822] border border-[#E6E1D6] dark:border-slate-700 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  Navigasi Utama
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Akses cepat menuju modul inventaris aset, pencatatan sirkulasi unit, dan verifikasi fisik stiker barcode.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <Link
                to="/assets"
                className="min-h-[44px] flex items-center gap-2.5 p-3 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] hover:bg-[#F4F0EA] dark:border-slate-700 dark:bg-[#111822] dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-[#1E3A5F] dark:text-[#FAF7F2]"
              >
                <Monitor size={16} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                <span>Inventaris Aset</span>
              </Link>

              <Link
                to="/borrowings"
                className="min-h-[44px] flex items-center gap-2.5 p-3 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] hover:bg-[#F4F0EA] dark:border-slate-700 dark:bg-[#111822] dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-[#1E3A5F] dark:text-[#FAF7F2]"
              >
                <Handshake size={16} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                <span>Sirkulasi Pinjam</span>
              </Link>

              <Link
                to="/categories"
                className="min-h-[44px] flex items-center gap-2.5 p-3 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] hover:bg-[#F4F0EA] dark:border-slate-700 dark:bg-[#111822] dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-[#1E3A5F] dark:text-[#FAF7F2]"
              >
                <Briefcase size={16} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                <span>Kategori Aset</span>
              </Link>

              <Link
                to="/activity-logs"
                className="min-h-[44px] flex items-center gap-2.5 p-3 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] hover:bg-[#F4F0EA] dark:border-slate-700 dark:bg-[#111822] dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-[#1E3A5F] dark:text-[#FAF7F2]"
              >
                <Clock size={16} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                <span>Log Aktivitas</span>
              </Link>
            </div>
          </div>

          {/* =====================================================================
              MODULE 3: 6 CLEAN WHITE METRIC CARDS
              - Clean white cards (bg-white border border-[#E6E1D6] rounded-xl p-5 shadow-xs)
              - Bold numbers in #1E3A5F
              - Subtle warm-tinted icon boxes (bg-[#FAF7F2])
          ===================================================================== */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2B4C6F] dark:text-slate-300">
                Matriks Ledgers & Sirkulasi Unit
              </span>
              <span className="text-xs text-slate-400 font-medium">
                6 Metrik Operasional
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">

              {/* 1. Total Aset */}
              <div className="rounded-xl border border-[#E6E1D6] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1A2433] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Aset
                  </span>
                  <div className="rounded-lg bg-[#FAF7F2] p-2 text-[#1E3A5F] dark:bg-[#111822] dark:text-[#F4B752]">
                    <Monitor size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#1E3A5F] dark:text-[#FAF7F2] tabular-nums">
                    {stats.total_assets}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    Seluruh unit ledger
                  </p>
                </div>
              </div>

              {/* 2. Unit Tersedia */}
              <div className="rounded-xl border border-[#E6E1D6] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1A2433] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Unit Tersedia
                  </span>
                  <div className="rounded-lg bg-[#FAF7F2] p-2 text-emerald-700 dark:bg-[#111822] dark:text-emerald-400">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#1E3A5F] dark:text-[#FAF7F2] tabular-nums">
                    {stats.available_assets}
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 truncate">
                    Siap dialokasikan
                  </p>
                </div>
              </div>

              {/* 3. Aset Dipinjam */}
              <div className="rounded-xl border border-[#E6E1D6] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1A2433] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Aset Dipinjam
                  </span>
                  <div className="rounded-lg bg-[#FAF7F2] p-2 text-amber-700 dark:bg-[#111822] dark:text-amber-400">
                    <Briefcase size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#1E3A5F] dark:text-[#FAF7F2] tabular-nums">
                    {stats.borrowed_assets}
                  </div>
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 truncate">
                    Pemakaian dinas
                  </p>
                </div>
              </div>

              {/* 4. Sirkulasi Berjalan */}
              <div className="rounded-xl border border-[#E6E1D6] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1A2433] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sirkulasi Berjalan
                  </span>
                  <div className="rounded-lg bg-[#FAF7F2] p-2 text-[#2B4C6F] dark:bg-[#111822] dark:text-[#F4B752]">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#1E3A5F] dark:text-[#FAF7F2] tabular-nums">
                    {stats.active_borrowings}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Tiket belum tutup
                  </p>
                </div>
              </div>

              {/* 5. Perawatan */}
              <div className="rounded-xl border border-[#E6E1D6] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1A2433] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Perawatan
                  </span>
                  <div className="rounded-lg bg-[#FAF7F2] p-2 text-slate-700 dark:bg-[#111822] dark:text-slate-300">
                    <Wrench size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#1E3A5F] dark:text-[#FAF7F2] tabular-nums">
                    {stats.maintenance_assets}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    Servis berkala
                  </p>
                </div>
              </div>

              {/* 6. Pensiun / Dihapus */}
              <div className="rounded-xl border border-[#E6E1D6] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1A2433] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Pensiun / Dihapus
                  </span>
                  <div className="rounded-lg bg-[#FAF7F2] p-2 text-rose-700 dark:bg-[#111822] dark:text-rose-400">
                    <ShieldOff size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#1E3A5F] dark:text-[#FAF7F2] tabular-nums">
                    {stats.retired_assets}
                  </div>
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 truncate">
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
