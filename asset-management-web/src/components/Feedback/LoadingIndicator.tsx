import React from 'react';

// Pastikan mendefinisikan interface props dengan jelas
interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = 'Memuat data dari server...' }) => {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <span className="animate-pulse">⏳</span>
      <span className="ml-2">{message}</span>
    </div>
  );
};
