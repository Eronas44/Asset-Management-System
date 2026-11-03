import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  traceId?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, traceId }) => (
  <div className="mb-4 flex items-start gap-3 rounded-md border border-rose-900/15 bg-rose-50/70 p-4 text-xs text-rose-900 dark:border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-200">
    <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-700 dark:text-rose-400" />
    <div className="flex-1">
      <strong className="block font-semibold uppercase tracking-wide text-[11px]">Kendala Pemrosesan Permintaan</strong>
      <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">{message}</p>
      {traceId && (
        <small className="mt-2 block font-mono text-[10px] text-slate-500 dark:text-slate-400">
          Trace ID Pelacakan: {traceId}
        </small>
      )}
    </div>
  </div>
);
