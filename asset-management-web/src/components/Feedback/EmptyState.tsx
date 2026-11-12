import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState: React.FC<{ message?: string }> = ({ message = 'Tidak ada rekaman data ditemukan.' }) => (
  <div className="flex flex-col items-center justify-center rounded-md border border-slate-200/90 bg-slate-50/50 px-6 py-10 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
    <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
      <Inbox size={17} />
    </div>
    <span className="font-medium text-slate-600 dark:text-slate-300">{message}</span>
  </div>
);
