import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = 'Memuat data dari server...' }) => {
  return (
    <div className="flex items-center justify-center gap-2.5 rounded-md border border-slate-200/90 bg-white px-5 py-4 text-center text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-200" />
      <span>{message}</span>
    </div>
  );
};
