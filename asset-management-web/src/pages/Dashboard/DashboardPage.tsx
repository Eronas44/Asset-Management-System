import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';
import type { DashboardStats, DashboardAlerts } from '../../types/dashboard';
import type { AssetBorrowing } from '../../types/asset-borrowing';
import { formatRupiah } from '../../utils/format';
import { LoadingIndicator } from '../../components/Feedback/LoadingIndicator';
import { ErrorMessage } from '../../components/Feedback/ErrorMessage';
import { extractErrorMessage } from '../../utils/error';
import { AlertCircle, CheckCircle2, TrendingUp, Monitor, Briefcase, Wrench, ShieldOff, Clock } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, roles } = useAuth();

  // State Manajemen Data Dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlerts | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorDetails, setErrorDetails] = useState<{ message: string; traceId?: string } | null>(null);

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

  return (
    <div className="space-y-5 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Pusat Kendali Eksekutif
            </h1>
            <span className="rounded border border-slate-200/90 bg-slate-100/70 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
              Real-time Overview
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Selamat datang, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Administrator'}</span>. Hak otorisasi aktif: <span className="font-mono text-slate-700 dark:text-slate-300">[{roles.join(', ')}]</span>.
          </p>
        </div>
      </div>

      {/* PANEL PERINGATAN KETERLAMBATAN (ALERT CENTER PANEL) */}
      {alerts && (
        <div className={`rounded-md border p-4 transition-all ${
          alerts.overdue_borrowings > 0 
            ? 'border-amber-800/20 bg-amber-50/70 text-amber-900 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-200' 
            : 'border-emerald-800/20 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {alerts.overdue_borrowings > 0 ? (
                <AlertCircle size={18} className="text-amber-700 dark:text-amber-400" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-700 dark:text-emerald-400" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider">
                {alerts.overdue_borrowings > 0 ? 'Pemberitahuan Audit: Peminjaman Terlambat' : 'Status Sirkulasi Operasional Aman'}
              </h2>
              
              {alerts.overdue_borrowings === 0 ? (
                <p className="mt-0.5 text-xs text-emerald-800/80 dark:text-emerald-300/90 font-medium">
                  Seluruh peminjaman aset inventaris berjalan sesuai jadwal operasional. Tidak ada unit yang mengalami keterlambatan pengembalian.
                </p>
              ) : (
                <div className="mt-2.5">
                  <p className="mb-3 text-xs text-amber-900/90 dark:text-amber-200 font-medium">
                    Terdeteksi <strong className="font-bold underline underline-offset-2">{alerts.overdue_borrowings}</strong> unit aset melewati tanggal pengembalian yang disepakati:
                  </p>
                  
                  <div className="overflow-hidden rounded-md border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                          <tr>
                            <th className="px-3.5 py-2.5">Aset Inventaris</th>
                            <th className="px-3.5 py-2.5">Peminjam</th>
                            <th className="px-3.5 py-2.5">Batas Pengembalian</th>
                            <th className="px-3.5 py-2.5 text-rose-700 dark:text-rose-400">Keterlambatan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {alerts.overdue_assets.map((item: AssetBorrowing) => (
                            <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-3.5 py-2.5">
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{item.asset?.name}</div>
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout untuk Kartu Informasi Statistik (Stat Cards) */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {/* Card: Total Aset */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Aset
              </span>
              <div className="rounded border border-slate-200 bg-slate-50 p-1.5 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Monitor size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {stats.total_assets}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Seluruh unit terdaftar di ledger</p>
            </div>
          </div>

          {/* Card: Tersedia */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Unit Tersedia
              </span>
              <div className="rounded border border-emerald-800/20 bg-emerald-50 p-1.5 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-800 dark:text-emerald-300 tabular-nums">
                {stats.available_assets}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Siap dialokasikan / dipinjam</p>
            </div>
          </div>

          {/* Card: Dipinjam */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aset Dipinjam
              </span>
              <div className="rounded border border-amber-800/20 bg-amber-50 p-1.5 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-300">
                <Briefcase size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-800 dark:text-amber-300 tabular-nums">
                {stats.borrowed_assets}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Sedang dalam pemakaian aktif</p>
            </div>
          </div>

          {/* Card: Peminjaman Aktif */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sirkulasi Berjalan
              </span>
              <div className="rounded border border-slate-200 bg-slate-50 p-1.5 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <TrendingUp size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {stats.active_borrowings}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Tiket peminjaman belum ditutup</p>
            </div>
          </div>

          {/* Card: Maintenance */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Perawatan
              </span>
              <div className="rounded border border-slate-200 bg-slate-50 p-1.5 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Wrench size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-800 dark:text-slate-200 tabular-nums">
                {stats.maintenance_assets}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Unit servis & reparasi berkala</p>
            </div>
          </div>

          {/* Card: Retired */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pensiun / Dihapus
              </span>
              <div className="rounded border border-rose-800/20 bg-rose-50 p-1.5 text-rose-800 dark:border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-300">
                <ShieldOff size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-800 dark:text-rose-300 tabular-nums">
                {stats.retired_assets}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Dihapusbukukan / habis manfaat</p>
            </div>
          </div>

          {/* Card: Total Nilai Buku (Executive Panel) */}
          <div className="sm:col-span-2 rounded-md border border-slate-900 bg-slate-900 p-5 text-white dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">
                  Total Nilai Buku Fiskal (Net Book Value)
                </span>
                <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  Audit Ready
                </span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
                {formatRupiah(stats.total_book_value)}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              Akumulasi nilai buku ekonomis dari seluruh unit aktif setelah memperhitungkan depresiasi garis lurus tahun berjalan.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

export default DashboardPage;

