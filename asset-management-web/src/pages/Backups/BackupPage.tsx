import React, { useEffect, useState } from 'react';
import { backupService } from '../../services/backup.service';
import type { BackupFile } from '../../types/backup';
import { LoadingIndicator } from '../../components/Feedback/LoadingIndicator';
import { ErrorMessage } from '../../components/Feedback/ErrorMessage';
import { extractErrorMessage } from '../../utils/error';
import { useToast } from '../../components/Feedback/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Database, Download, RotateCcw, FileArchive, Clock3, AlertTriangle } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Cadangan & Pemulihan Basis Data
              </h1>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            <Database size={14} />
            Buat Snapshot Baru
          </button>
        </div>
      </div>

      {/* Operational Notice / Safety Alert */}
      <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-semibold">Protokol Pemulihan Basis Data:</span> Operasi restore akan menimpa seluruh tabel aktif dengan snapshot terpilih. Pastikan Anda mengunduh arsip cadangan terbaru sebelum mengeksekusi pemulihan.
          </div>
        </div>
      </div>

      {actionLoading && <LoadingIndicator message={actionLoading} />}
      {errorDetails && <ErrorMessage message={errorDetails.message} traceId={errorDetails.traceId} />}

      {/* Backups Table / Cards */}
      <div className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Daftar Arsip Snapshot
            </h2>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
            <Clock3 size={13} />
            <span>Total: {backups.length} Arsip</span>
          </div>
        </div>

        {backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-500">
              <FileArchive size={20} />
            </div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Belum ada file cadangan</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Klik tombol snapshot di atas untuk menghasilkan arsip basis data pertama.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="divide-y divide-slate-100 p-3 md:hidden dark:divide-slate-800">
              {backups.map((b) => (
                <div key={b.filename} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-semibold break-all text-slate-900 dark:text-white">
                      {b.filename}
                    </span>
                    <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {b.size_human}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
                        className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <Download size={12} />
                        Unduh
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestoreTarget(b.filename)}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                      >
                        <RotateCcw size={12} />
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
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Nama Berkas Arsip</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Ukuran File</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Waktu Pembuatan</th>
                    <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-[11px]">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/80 dark:bg-slate-900">
                  {backups.map((b) => (
                    <tr key={b.filename} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
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
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Download size={12} className="text-slate-400" />
                            Unduh
                          </button>
                          <button
                            type="button"
                            onClick={() => setRestoreTarget(b.filename)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 shadow-2xs transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
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
