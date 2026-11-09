import React, { useEffect, useState } from 'react';
import { activityLogService } from '../../services/activity-log.service';
import type { ActivityLog, ActivityLogFilterParams } from '../../types/activity-log';
import { Clock3, Filter, ChevronLeft, ChevronRight, ShieldAlert, Activity, User, Terminal, RefreshCw, AlertCircle } from 'lucide-react';

const ActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchLogs = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await activityLogService.getAll(filters);
      setLogs(response.data);
      setPaginationMeta({
        current_page: response.meta.current_page,
        last_page: response.meta.last_page,
        total: response.meta.total
      });
    } catch (err: unknown) {
      console.error('Gagal memuat log aktivitas:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr?.response?.data?.message || 'Gagal memuat catatan log aktivitas dari server.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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
        className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300'
      };
    }
    if (action === 'logout') {
      return {
        label: 'AUTH / LOGOUT',
        className: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      };
    }
    if (action.startsWith('create')) {
      return {
        label: 'DATA / CREATE',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300'
      };
    }
    if (action.startsWith('update')) {
      return {
        label: 'DATA / UPDATE',
        className: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-300'
      };
    }
    if (action.startsWith('delete')) {
      return {
        label: 'DATA / DELETE',
        className: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300'
      };
    }
    if (action.startsWith('borrow')) {
      return {
        label: 'SIRKULASI / PINJAM',
        className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300'
      };
    }
    if (action.startsWith('return')) {
      return {
        label: 'SIRKULASI / KEMBALI',
        className: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/40 dark:bg-teal-950/40 dark:text-teal-300'
      };
    }
    if (action.includes('backup') || action.includes('restore')) {
      return {
        label: 'SYSTEM / BACKUP',
        className: 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900/40 dark:bg-purple-950/40 dark:text-purple-300'
      };
    }
    return {
      label: action.toUpperCase(),
      className: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
    };
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E6E1D6] pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#2B4C6F] dark:text-[#FAF7F2]">
              Log Audit & Jejak Aktivitas
            </h1>
            <span className="rounded-full bg-[#F4B752] px-2.5 py-0.5 text-xs font-semibold text-slate-900">
              Log Sistem
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Rekam jejak seluruh operasi sistem, otentikasi login, serta perubahan status aset.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchLogs(true)}
            disabled={loading || isRefreshing}
            className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#FAF7F2] disabled:opacity-50 dark:border-slate-800 dark:bg-[#1A2433] dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Segarkan rekaman log audit terbaru"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#1E3A5F] dark:text-[#F4B752]' : ''} />
            <span className="hidden sm:inline">Segarkan Log</span>
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl border border-[#E6E1D6] bg-white px-3.5 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-[#1A2433] dark:text-slate-300 shadow-2xs">
            <Clock3 size={15} className="text-[#1E3A5F] dark:text-[#F4B752]" />
            <span className="font-mono font-bold text-slate-900 dark:text-white">{paginationMeta.total}</span>
            <span className="text-slate-400">catatan riwayat</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-[#E6E1D6] bg-white p-4 dark:border-slate-800 dark:bg-[#1A2433] shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2B4C6F] dark:text-[#FAF7F2]">
            <Filter size={14} className="text-[#1E3A5F] dark:text-[#F4B752]" />
            <span>Penyaringan Aktivitas</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:flex-1">
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              aria-label="Filter jenis aktivitas"
              className="h-10 rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 text-xs text-slate-800 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:focus:border-[#F4B752]"
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
              <span className="text-[11px] text-slate-400 font-mono">Dari:</span>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                aria-label="Filter tanggal mulai"
                className="h-10 w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 font-mono text-xs text-slate-800 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:focus:border-[#F4B752]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Sampai:</span>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                aria-label="Filter tanggal akhir"
                className="h-10 w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 font-mono text-xs text-slate-800 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:focus:border-[#F4B752]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white dark:border-slate-800 dark:bg-[#1A2433] shadow-xs">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#1E3A5F] dark:border-slate-700 dark:border-t-[#F4B752]" />
            <p>Memuat riwayat log sistem...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E6E1D6] bg-[#FAF7F2] text-slate-400 dark:border-slate-800 dark:bg-[#111822] dark:text-slate-500">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2B4C6F] dark:text-[#FAF7F2]">Tidak ada aktivitas yang tercatat</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tidak ada log yang cocok dengan kriteria filter saat ini.</p>
          </div>
        ) : (
          <div className="p-5 sm:p-7">
            {/* Vertical Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E6E1D6] dark:before:bg-slate-800">
              {logs.map((log) => {
                const badge = getActionBadge(log.action);
                const timestamp = new Date(log.created_at).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });

                return (
                  <div key={log.id} className="relative group">
                    {/* Clean Timeline Node */}
                    <div className="absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[#E6E1D6] bg-white dark:border-slate-700 dark:bg-[#111822] shadow-2xs transition-transform group-hover:scale-105">
                      <Activity size={13} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                    </div>

                    {/* Timeline Event Card */}
                    <div className="rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/50 p-4 transition-colors hover:bg-white dark:border-slate-800 dark:bg-[#151D2A]/60 dark:hover:bg-[#151D2A]">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wide ${badge.className}`}>
                            <Terminal size={10} />
                            {badge.label}
                          </span>
                          
                          {/* Actor Badge */}
                          <span className="inline-flex items-center gap-1 rounded-md border border-[#E6E1D6] bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <User size={11} className="text-slate-400" />
                            {log.operator}
                          </span>
                        </div>

                        {/* Monospace Timestamp Tag */}
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-[#111822] px-2.5 py-1 rounded-md border border-[#E6E1D6] dark:border-slate-800">
                          {timestamp}
                        </span>
                      </div>

                      {/* Operation Description */}
                      <p className="mt-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        {log.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && logs.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E6E1D6] bg-[#FAF7F2]/50 px-5 py-3 dark:border-slate-800 dark:bg-[#151D2A]/50 sm:flex-row">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Halaman <span className="font-mono font-semibold text-slate-900 dark:text-white">{paginationMeta.current_page}</span> dari <span className="font-mono font-semibold text-slate-900 dark:text-white">{paginationMeta.last_page}</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                disabled={paginationMeta.current_page === 1}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#E6E1D6] bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={13} /> Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(paginationMeta.current_page + 1)}
                disabled={paginationMeta.current_page === paginationMeta.last_page}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#E6E1D6] bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300 dark:hover:bg-slate-800"
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
