import React, { useEffect, useState } from 'react';
import { backupService } from '../../services/backup.service';
import type { BackupFile } from '../../types/backup';
import { LoadingIndicator } from '../../components/Feedback/LoadingIndicator';
import { ErrorMessage } from '../../components/Feedback/ErrorMessage';
import { extractErrorMessage } from '../../utils/error';
import { Database, Download, RefreshCcw, ShieldAlert, FileArchive, Clock3 } from 'lucide-react';

const BackupPage: React.FC = () => {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string; traceId?: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

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
    setMessage(null);
    setActionLoading('Mencadangkan database...');
    try {
      await backupService.create();
      setMessage({ text: 'Backup database baru berhasil dibuat!', isError: false });
      fetchBackups();
    } catch (err) {
      const extracted = extractErrorMessage(err);
      setMessage({ text: `Gagal membuat backup: ${extracted.message}`, isError: true });
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
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh file backup.');
    }
  };

  const handleRestore = async (filename: string) => {
    // Wajib ada konfirmasi ketat untuk operasi berisiko tinggi sesuai petunjuk arsitektur
    const confirmFirst = window.confirm(`⚠️ PERINGATAN RISIKO TINGGI!\n\nApakah Anda yakin ingin memulihkan (Restore) database menggunakan file "${filename}"?\nData saat ini akan sepenuhnya digantikan oleh data dari file cadangan tersebut.`);
    if (!confirmFirst) return;

    const confirmSecond = window.confirm(`Sekali lagi, pastikan Anda tahu apa yang Anda lakukan.\n\nLanjutkan proses restore database?`);
    if (!confirmSecond) return;

    setMessage(null);
    setActionLoading('Sedang memulihkan database sistem...');
    try {
      await backupService.restore(filename);
      setMessage({ text: 'Database sistem berhasil dipulihkan ke status cadangan!', isError: false });
      fetchBackups();
    } catch (err) {
      const extracted = extractErrorMessage(err);
      setMessage({ text: `Gagal memulihkan database: ${extracted.message}`, isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && backups.length === 0) return <LoadingIndicator message="Memuat daftar arsip cadangan database..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-slate-800 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300 mb-3">
            <Database size={14} /> Backup Center
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Backup & Restore</h2>
          <p className="mt-1 text-gray-500 dark:text-slate-400">Buat cadangan baru, unduh arsip, dan pulihkan database dari file SQL yang tersedia.</p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={actionLoading !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCcw size={18} /> Buat Backup Baru
        </button>
      </div>

      {actionLoading && <LoadingIndicator message={actionLoading} />}
      {errorDetails && <ErrorMessage message={errorDetails.message} traceId={errorDetails.traceId} />}
      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${message.isError ? 'border-red-100 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100' : 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100'}`}>
          {message.text}
        </div>
      )}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-slate-800">
          <div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white">Arsip File Cadangan</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Daftar file .sql yang bisa diunduh atau dipakai untuk restore.</p>
          </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock3 size={14} /> Total: {backups.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          {backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-slate-800 dark:text-slate-500">
                <FileArchive size={32} />
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white">Belum ada file cadangan</h3>
              <p className="max-w-sm text-gray-500 dark:text-slate-400">Buat backup baru terlebih dahulu untuk menambahkan arsip cadangan database ke daftar ini.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
              <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama File Arsip</th>
                  <th className="px-6 py-4 whitespace-nowrap">Ukuran</th>
                  <th className="px-6 py-4 whitespace-nowrap">Tanggal Dibuat</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {backups.map((b) => (
                  <tr key={b.filename} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-slate-800/70">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{b.filename}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-slate-300">{b.size_human}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-400">
                      {new Date(b.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-2">
                        <button 
                          onClick={() => handleDownload(b.filename)}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-100 dark:hover:bg-sky-500/20"
                        >
                          <Download size={14} /> Download
                        </button>
                        <button 
                          onClick={() => handleRestore(b.filename)}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/20"
                        >
                          <ShieldAlert size={14} /> Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
