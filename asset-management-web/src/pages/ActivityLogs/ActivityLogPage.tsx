import React, { useEffect, useState } from 'react';
import { activityLogService } from '../../services/activity-log.service';
import type { ActivityLog, ActivityLogFilterParams } from '../../types/activity-log';
import { Clock3, Filter, History, Search, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';

const ActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // State Terpadu untuk Filter dan Paginasi
  const [filters, setFilters] = useState<ActivityLogFilterParams>({
    action: '',
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 10
  });

  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await activityLogService.getAll(filters);
      setLogs(response.data);
      setPaginationMeta({
        current_page: response.meta.current_page,
        last_page: response.meta.last_page,
        total: response.meta.total
      });
    } catch (err) {
      console.error('Gagal memuat log aktivitas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleFilterChange = (field: keyof ActivityLogFilterParams, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1 // Reset halaman ke 1 setiap kali filter berubah
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage
    }));
  };

  const actionLabel = (action: string) => {
    if (action === 'login') return 'Login';
    if (action.startsWith('create')) return 'Create';
    if (action.startsWith('borrow')) return 'Borrow';
    if (action.startsWith('return')) return 'Return';
    return 'Update';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-slate-800 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300 mb-3">
            <History size={14} /> Audit Trail
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Riwayat Aktivitas Sistem</h2>
          <p className="mt-1 text-gray-500 dark:text-slate-400">Pantau login, perubahan data, dan transaksi penting yang terjadi di sistem.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <Clock3 size={16} className="text-indigo-600 dark:text-indigo-300" />
          <span>{paginationMeta.total} entri tercatat</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:flex-row xl:items-center">
        <div className="flex shrink-0 items-center gap-2 font-semibold text-gray-700 dark:text-slate-200">
          <Filter size={18} />
          <span>Filter Log</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-slate-500" />
            </div>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Semua Aktivitas</option>
              <option value="login">Login</option>
              <option value="create_category">Tambah Kategori</option>
              <option value="create_location">Tambah Lokasi</option>
              <option value="create_asset">Tambah Aset</option>
              <option value="borrow_asset">Peminjaman Aset</option>
              <option value="return_asset">Pengembalian Aset</option>
            </select>
          </div>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">Daftar Riwayat Aktivitas</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Menampilkan {paginationMeta.total} entri yang cocok dengan filter aktif.</p>
          </div>
          <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Halaman {paginationMeta.current_page} / {paginationMeta.last_page}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-slate-400">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p>Memuat data jejak audit...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-slate-800 dark:text-slate-500">
                <ShieldAlert size={32} />
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white">Tidak ada aktivitas yang cocok</h3>
              <p className="max-w-sm text-gray-500 dark:text-slate-400">Coba longgarkan filter tanggal atau jenis aktivitas untuk melihat log lain.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
              <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th className="whitespace-nowrap px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="whitespace-nowrap px-6 py-4">Jenis</th>
                  <th className="px-6 py-4">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-slate-800/70">
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">{log.operator}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                        log.action === 'login'
                          ? 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                          : log.action.startsWith('create')
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100'
                            : log.action.startsWith('borrow')
                              ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100'
                              : 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-100'
                      }`}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && logs.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/40 px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
            <span className="text-sm text-gray-600 dark:text-slate-300">
              Halaman <strong className="text-gray-800 dark:text-white">{paginationMeta.current_page}</strong> dari <strong className="text-gray-800 dark:text-white">{paginationMeta.last_page}</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                disabled={paginationMeta.current_page === 1}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>
              <button
                onClick={() => handlePageChange(paginationMeta.current_page + 1)}
                disabled={paginationMeta.current_page === paginationMeta.last_page}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Berikutnya
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
