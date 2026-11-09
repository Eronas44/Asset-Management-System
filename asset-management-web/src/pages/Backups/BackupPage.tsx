import React, { useEffect, useState } from 'react';
import { backupService } from '../../services/backup.service';
import type { BackupFile } from '../../types/backup';
import { LoadingIndicator } from '../../components/Feedback/LoadingIndicator';
import { ErrorMessage } from '../../components/Feedback/ErrorMessage';
import { extractErrorMessage } from '../../utils/error';
import { useToast } from '../../components/Feedback/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Database, Download, RotateCcw, FileArchive, Clock3, AlertTriangle, ShieldCheck, HardDrive } from 'lucide-react';

const BackupPage: React.FC = () => {
  const { showToast } = useToast();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string; traceId?: string } | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    setErrorDetails(null);
    try {
      const response = await backupService.getAll();
      setBackups(response.data);
    } catch (err) {
      const extracted = extractErrorMessage(err);
      setErrorDetails({ message: extracted.message, traceId: extracted.traceId });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setActionLoading('Memproses snapshot database...');
    try {
      await backupService.create();
      showToast('Arsip cadangan database baru berhasil dibuat.', 'success');
      fetchBackups();
    } catch (err) {
      const extracted = extractErrorMessage(err);
      showToast(`Gagal membuat backup: ${extracted.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const blob = await backupService.download(filename);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      showToast(`Mengunduh berkas ${filename}`, 'info');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengunduh file backup.', 'error');
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreTarget) return;
    const filename = restoreTarget;
    setRestoreTarget(null);

    setActionLoading('Sedang memulihkan struktur dan data database...');
    try {
      await backupService.restore(filename);
      showToast('Database sistem berhasil dipulihkan dari arsip snapshot.', 'success');
      fetchBackups();
    } catch (err) {
      const extracted = extractErrorMessage(err);
      showToast(`Gagal memulihkan database: ${extracted.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && backups.length === 0) return <LoadingIndicator message="Memuat arsip cadangan sistem..." />;

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E0D8] pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cadangan & Pemulihan Basis Data
            </h1>
            <span className="rounded-md border border-[#E2E0D8] bg-white/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-300">
              Disaster Recovery
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pengelolaan snapshot berkala database SQL, pengunduhan arsip lokal, dan pemulihan darurat sistem.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateBackup}
          disabled={actionLoading !== null}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
        >
          <Database size={16} strokeWidth={2.5} />
          <span>Buat Snapshot Baru</span>
        </button>
      </div>

      {/* Bento Status & Safety Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: Snapshot Telemetry */}
        <div className="rounded-2xl border border-[#E2E0D8] bg-white p-5 dark:border-white/10 dark:bg-slate-900/70 shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <HardDrive size={15} className="text-blue-600 dark:text-sky-400" />
            <span>Arsip Terindeks</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">{backups.length}</span>
            <span className="text-xs text-slate-500">berkas snapshot</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Siap untuk pemulihan instan (hot-swap)</p>
        </div>

        {/* Module 2: Security & Integrity State */}
        <div className="rounded-2xl border border-[#E2E0D8] bg-white p-5 dark:border-white/10 dark:bg-slate-900/70 shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>Integritas Arsip</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Protokol Siaga Aktif</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Enkripsi dump SQL kompatibel dengan InnoDB</p>
        </div>

        {/* Module 3: Protocol Warning */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/60 p-5 dark:border-amber-500/20 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold">Protokol Restore:</span> Tindakan pemulihan akan menimpa seluruh tabel aktif. Unduh snapshot sebelum mengeksekusi restore darurat.
            </div>
          </div>
        </div>
      </div>

      {actionLoading && <LoadingIndicator message={actionLoading} />}
      {errorDetails && <ErrorMessage message={errorDetails.message} traceId={errorDetails.traceId} />}

      {/* Backups Table / Bento Card Container */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E0D8] bg-white dark:border-white/10 dark:bg-slate-900/70 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-[#E2E0D8] px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Daftar Arsip Snapshot Basis Data
            </h2>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
            <Clock3 size={13} />
            <span>Total: {backups.length} Arsip</span>
          </div>
        </div>

        {backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-500">
              <FileArchive size={24} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Belum ada file cadangan</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Klik tombol snapshot di atas untuk menghasilkan arsip basis data pertama.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Stacked Bento Cards */}
            <div className="space-y-3 p-4 md:hidden">
              {backups.map((b) => (
                <div key={b.filename} className="rounded-xl border border-[#E2E0D8] bg-white p-4 dark:border-white/10 dark:bg-slate-850/70 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold break-all text-slate-900 dark:text-white">
                      {b.filename}
                    </span>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {b.size_human}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-[11px]">
                      {new Date(b.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(b.filename)}
                        disabled={actionLoading !== null}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <Download size={14} className="text-blue-600 dark:text-sky-400" />
                        Unduh
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestoreTarget(b.filename)}
                        disabled={actionLoading !== null}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 shadow-2xs hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                      >
                        <RotateCcw size={14} className="text-rose-600 dark:text-rose-400" />
                        Restore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
                <thead className="bg-slate-100/90 text-slate-700 border-b border-slate-200/90 text-[11px] font-semibold uppercase tracking-wider dark:bg-slate-900/90 dark:text-slate-300 dark:border-b dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Nama Berkas Arsip</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Ukuran File</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Waktu Pembuatan</th>
                    <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-[11px]">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {backups.map((b) => (
                    <tr key={b.filename} className="transition-all hover:bg-slate-100/70 dark:hover:bg-indigo-950/30">
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-900 dark:text-white">
                        {b.filename}
                      </td>
                      <td className="px-5 py-3.5 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {b.size_human}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                        {new Date(b.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownload(b.filename)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Download size={12} className="text-blue-600 dark:text-sky-400" />
                            Unduh
                          </button>
                          <button
                            type="button"
                            onClick={() => setRestoreTarget(b.filename)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 shadow-2xs transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                          >
                            <RotateCcw size={12} className="text-rose-600 dark:text-rose-400" />
                            Pulihkan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog for Restore */}
      <ConfirmDialog
        isOpen={restoreTarget !== null}
        title="Konfirmasi Pemulihan Database"
        message={`PERINGATAN OPERASI KRITIS:\n\nApakah Anda yakin ingin memulihkan (Restore) database menggunakan arsip "${restoreTarget}"?\n\nSeluruh data transaksi dan entri sistem aktif saat ini akan ditimpa dengan snapshot dari berkas ini. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Pulihkan Sekarang"
        cancelLabel="Batal"
        variant="danger"
        isLoading={actionLoading !== null}
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
};

export default BackupPage;
