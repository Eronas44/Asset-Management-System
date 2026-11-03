import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ForbiddenPage: React.FC = () => {
  const { hasPermission, user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    if (hasPermission('view-reports')) return '/dashboard';
    if (hasPermission('manage-borrowings')) return '/borrowings';
    if (hasPermission('manage-assets')) return '/assets';
    return '/login';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70 px-4 antialiased dark:bg-slate-950 sm:px-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200/90 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          <ShieldAlert size={20} />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          HTTP 403 &bull; RESTRICTED
        </div>

        <h1 className="mt-3 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Akses Tidak Terotorisasi
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Akun Anda tidak memiliki perizinan peran (permission) yang memadai untuk membuka modul ini. Silakan hubungi Superuser sistem untuk peningkatan wewenang.
        </p>

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <Link
            to={getHomePath()}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            <ArrowLeft size={13} />
            Kembali ke Navigasi Utama
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
