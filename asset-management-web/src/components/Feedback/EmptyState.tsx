import React from 'react';
export const EmptyState: React.FC<{ message?: string }> = ({ message = 'Tidak ada rekaman data ditemukan.' }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
    📭 {message}
  </div>
);
