import React, { useEffect, useState } from 'react';
import { activityLogService } from '../../services/activity-log.service';
import type { ActivityLog, ActivityLogFilterParams } from '../../types/activity-log';
import { Clock3, Filter, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';

const ActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

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
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage
    }));
  };

  const getActionBadge = (action: string) => {
    if (action === 'login') {
      return {
        label: 'AUTH / LOGIN',
        className: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      };
    }
    if (action.startsWith('create')) {
      return {
        label: 'DATA / CREATE',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300'
      };
    }
    if (action.startsWith('borrow')) {
      return {
        label: 'CIRC / BORROW',
        className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300'
      };
    }
    if (action.startsWith('return')) {
      return {
        label: 'CIRC / RETURN',
        className: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300'
      };
    }
    return {
      label: action.toUpperCase(),
      className: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Log Audit & Jejak Aktivitas
              </h1>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Audit Trail
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Rekam jejak forensik seluruh operasi sistem, otentikasi login, serta perubahan siklus hidup aset.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock3 size={14} className="text-slate-500 dark:text-slate-400" />
            <span className="font-mono font-medium">{paginationMeta.total}</span>
            <span className="text-slate-400">entri terindeks</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Filter size={14} />
            <span>Filter Forensik</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:flex-1">
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              aria-label="Filter jenis aktivitas"
              className="rounded border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-slate-600"
            >
              <option value="">Semua Kategori Aktivitas</option>
              <option value="login">Otentikasi Login</option>
              <option value="create_category">Registrasi Kategori</option>
              <option value="create_location">Registrasi Lokasi</option>
              <option value="create_asset">Registrasi Aset Baru</option>
              <option value="borrow_asset">Sirkulasi: Peminjaman</option>
              <option value="return_asset">Sirkulasi: Pengembalian</option>
            </select>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Dari:</span>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                aria-label="Filter tanggal mulai"
                className="w-full rounded border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 font-mono text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-slate-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Sampai:</span>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                aria-label="Filter tanggal akhir"
                className="w-full rounded border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 font-mono text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-slate-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-slate-500 dark:text-slate-400">
              <div className="mb-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
              <p>Mengambil rekaman jejak audit...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-500">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Tidak ada aktivitas yang tercatat</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tidak ada log yang cocok dengan kriteria filter saat ini.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Waktu Eksekusi</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Operator</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Klasifikasi Aksi</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Rincian Operasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/80 dark:bg-slate-900">
                {logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-slate-500 dark:text-slate-400">
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                        {log.operator}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-mono font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Halaman <span className="font-mono font-semibold text-slate-900 dark:text-white">{paginationMeta.current_page}</span> dari <span className="font-mono font-semibold text-slate-900 dark:text-white">{paginationMeta.last_page}</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                disabled={paginationMeta.current_page === 1}
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={13} /> Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(paginationMeta.current_page + 1)}
                disabled={paginationMeta.current_page === paginationMeta.last_page}
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Berikutnya <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
