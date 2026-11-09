import React, { useEffect, useState } from 'react';
import { activityLogService } from '../../services/activity-log.service';
import type { ActivityLog, ActivityLogFilterParams } from '../../types/activity-log';
import { Clock3, Filter, ChevronLeft, ChevronRight, ShieldAlert, Activity, User, Terminal } from 'lucide-react';

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
        className: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        glow: 'shadow-[0_0_10px_rgba(37,99,235,0.25)] dark:shadow-[0_0_12px_rgba(56,189,248,0.35)]'
      };
    }
    if (action.startsWith('create')) {
      return {
        label: 'DATA / CREATE',
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.25)] dark:shadow-[0_0_12px_rgba(52,211,153,0.35)]'
      };
    }
    if (action.startsWith('borrow')) {
      return {
        label: 'CIRC / BORROW',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.25)]'
      };
    }
    if (action.startsWith('return')) {
      return {
        label: 'CIRC / RETURN',
        className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
        glow: 'shadow-[0_0_10px_rgba(56,189,248,0.25)]'
      };
    }
    return {
      label: action.toUpperCase(),
      className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300',
      glow: ''
    };
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E0D8] pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Log Audit & Jejak Aktivitas
            </h1>
            <span className="rounded-md border border-[#E2E0D8] bg-white/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-300">
              Telemetry Audit
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Rekam jejak forensik seluruh operasi sistem, otentikasi login, serta perubahan siklus hidup aset.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#E2E0D8] bg-white/80 px-3.5 py-2 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 shadow-2xs">
          <Clock3 size={15} className="text-blue-600 dark:text-sky-400" />
          <span className="font-mono font-bold text-slate-900 dark:text-white">{paginationMeta.total}</span>
          <span className="text-slate-400">entri telemetri</span>
        </div>
      </div>

      {/* Filter Toolbar (Bento Card) */}
      <div className="rounded-2xl border border-[#E2E0D8] bg-white p-4 dark:border-white/10 dark:bg-slate-900/70 shadow-xs backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Filter size={14} className="text-blue-600 dark:text-sky-400" />
            <span>Filter Forensik</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:flex-1">
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              aria-label="Filter jenis aktivitas"
              className="h-10 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-sky-400"
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
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 font-mono text-xs text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-sky-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Sampai:</span>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                aria-label="Filter tanggal akhir"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 font-mono text-xs text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-sky-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Audit Timeline Container */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E0D8] bg-white dark:border-white/10 dark:bg-slate-900/70 shadow-xs backdrop-blur-md">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-sky-400" />
            <p>Mengambil rekaman jejak audit forensik...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-500">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Tidak ada aktivitas yang tercatat</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tidak ada log yang cocok dengan kriteria filter saat ini.</p>
          </div>
        ) : (
          <div className="p-5 sm:p-7">
            {/* Vertical Telemetry Audit Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
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
                    {/* Glowing Telemetry Node */}
                    <div className={`absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${badge.glow} transition-transform group-hover:scale-110`}>
                      <Activity size={13} className="text-blue-600 dark:text-sky-400" />
                    </div>

                    {/* Timeline Event Card */}
                    <div className="rounded-xl border border-[#E2E0D8] bg-slate-50/50 p-4 transition-all hover:border-blue-500/40 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-850/50 dark:hover:border-sky-400/30 dark:hover:bg-slate-850">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wide ${badge.className}`}>
                            <Terminal size={10} />
                            {badge.label}
                          </span>
                          
                          {/* Actor Badge */}
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <User size={11} className="text-slate-400" />
                            {log.operator}
                          </span>
                        </div>

                        {/* Monospace Timestamp Tag */}
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-800">
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
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E2E0D8] bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Halaman <span className="font-mono font-semibold text-slate-900 dark:text-white">{paginationMeta.current_page}</span> dari <span className="font-mono font-semibold text-slate-900 dark:text-white">{paginationMeta.last_page}</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                disabled={paginationMeta.current_page === 1}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={13} /> Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(paginationMeta.current_page + 1)}
                disabled={paginationMeta.current_page === paginationMeta.last_page}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
