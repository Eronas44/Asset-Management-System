import React from 'react';
interface ErrorMessageProps { message: string; traceId?: string; }
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, traceId }) => (
  <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-800 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
    <strong className="block">⚠️ Gagal Memproses Permintaan:</strong>
    <p className="mt-1 text-sm text-rose-700 dark:text-rose-100/90">{message}</p>
    {traceId && <small className="mt-2 block text-xs text-rose-500 dark:text-rose-200/70">Trace ID Pelacakan: {traceId}</small>}
  </div>
);
