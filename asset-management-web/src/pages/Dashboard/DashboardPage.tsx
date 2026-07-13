import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';
import type { DashboardStats, DashboardAlerts } from '../../types/dashboard';
import { formatRupiah } from '../../utils/format';
import { LoadingIndicator } from '../../components/Feedback/LoadingIndicator';
import { ErrorMessage } from '../../components/Feedback/ErrorMessage';
import { extractErrorMessage } from '../../utils/error';
import { AlertCircle, CheckCircle2, TrendingUp, Monitor, Package, Briefcase, Wrench, ShieldOff, Clock } from 'lucide-react';

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
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Selamat Datang, {user?.name || 'Pengguna'}!</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Ringkasan status seluruh aset dan sirkulasi peminjaman Anda. Role Anda: <span className="font-semibold text-indigo-600 dark:text-indigo-300">{roles.join(', ')}</span>
          </p>
        </div>
      </div>

      {/* PANEL PERINGATAN KETERLAMBATAN (ALERT CENTER PANEL) */}
      {alerts && (
        <div className={`p-5 rounded-2xl border transition-all shadow-sm ${alerts.overdue_borrowings > 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-400/20' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-400/20'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 ${alerts.overdue_borrowings > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
              {alerts.overdue_borrowings > 0 ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div className="flex-1">
              <h4 className={`text-lg font-bold mb-1 ${alerts.overdue_borrowings > 0 ? 'text-amber-800 dark:text-amber-100' : 'text-emerald-800 dark:text-emerald-100'}`}>
                {alerts.overdue_borrowings > 0 ? 'Peringatan: Peminjaman Terlambat' : 'Status Sirkulasi Aman'}
              </h4>
              
              {alerts.overdue_borrowings === 0 ? (
                <p className={`text-sm ${alerts.overdue_borrowings > 0 ? 'text-amber-700 dark:text-amber-200' : 'text-emerald-700 dark:text-emerald-200'}`}>
                  Tidak ada aset yang terlambat dikembalikan. Semua berjalan sesuai jadwal.
                </p>
              ) : (
                <div className="mt-2">
                  <p className="mb-4 text-sm text-amber-700 dark:text-amber-200">
                    Terdapat <strong className="font-bold text-amber-900 dark:text-amber-100">{alerts.overdue_borrowings}</strong> aset terdeteksi melewati batas rencana tanggal pengembalian:
                  </p>
                  
                  <div className="overflow-hidden rounded-xl border border-amber-200 bg-white/60 shadow-sm backdrop-blur-sm dark:border-amber-400/20 dark:bg-slate-900/70">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-amber-200/50 bg-amber-100/50 font-semibold text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
                          <tr>
                            <th className="px-4 py-3">Nama Aset</th>
                            <th className="px-4 py-3">Nama Peminjam</th>
                            <th className="px-4 py-3">Batas Waktu</th>
                            <th className="px-4 py-3 text-red-600">Keterlambatan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100/50 dark:divide-amber-400/10">
                          {alerts.overdue_assets.map((item: any) => (
                            <tr key={item.id} className="transition-colors hover:bg-amber-50/50 dark:hover:bg-slate-800/70">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-800 dark:text-slate-100">{item.asset?.name}</div>
                                <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">{item.asset?.asset_code}</div>
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{item.borrower_name}</td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.expected_return_at}</td>
                              <td className="flex items-center gap-1.5 px-4 py-3 font-bold text-red-600 dark:text-red-300">
                                <Clock size={14} />
                                {item.overdue_days} Hari
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          
          {/* Card: Total Aset */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow group hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package size={80} className="text-indigo-600 transform translate-x-4 -translate-y-4" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Monitor size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="mb-1 text-3xl font-bold text-slate-800 dark:text-white">{stats.total_assets}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Aset Keseluruhan</p>
            </div>
          </div>

          {/* Card: Tersedia */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow group hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="mb-1 text-3xl font-bold text-slate-800 dark:text-white">{stats.available_assets}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aset Tersedia (Available)</p>
            </div>
          </div>

          {/* Card: Dipinjam */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow group hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                <Briefcase size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="mb-1 text-3xl font-bold text-slate-800 dark:text-white">{stats.borrowed_assets}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aset Dipinjam (Borrowed)</p>
            </div>
          </div>

          {/* Card: Peminjaman Aktif */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow group hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="mb-1 text-3xl font-bold text-slate-800 dark:text-white">{stats.active_borrowings}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Transaksi Peminjaman Aktif</p>
            </div>
          </div>

          {/* Card: Maintenance */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow group hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                <Wrench size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="mb-1 text-3xl font-bold text-slate-800 dark:text-white">{stats.maintenance_assets}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Dalam Perawatan (Maintenance)</p>
            </div>
          </div>

          {/* Card: Retired */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow group hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="rounded-lg bg-gray-100 p-2 text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                <ShieldOff size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="mb-1 text-3xl font-bold text-slate-800 dark:text-white">{stats.retired_assets}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aset Pensiun (Retired)</p>
            </div>
          </div>

          {/* Card: Total Nilai Buku */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-600 bg-gradient-to-br from-indigo-900 to-indigo-700 p-5 text-white shadow-md sm:col-span-2 group dark:from-indigo-950 dark:to-slate-900">
            <div className="absolute -right-4 -bottom-4 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-center">
              <p className="text-indigo-200 font-medium text-sm tracking-wide mb-1 uppercase">Total Nilai Buku Ekonomis</p>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">{formatRupiah(stats.total_book_value)}</h3>
              <p className="text-indigo-200/70 text-sm">Estimasi nilai sisa dari seluruh aset yang tercatat</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default DashboardPage;

