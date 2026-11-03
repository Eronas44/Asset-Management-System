import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const iconMap = {
    danger: <AlertTriangle size={22} className="text-rose-600 dark:text-rose-400" />,
    warning: <AlertCircle size={22} className="text-amber-600 dark:text-amber-400" />,
    info: <Info size={22} className="text-indigo-600 dark:text-indigo-400" />,
  };

  const badgeBgMap = {
    danger: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/50',
    info: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900/50',
  };

  const confirmBtnMap = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/30',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/30',
    info: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white focus:ring-slate-900/20',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isLoading) onCancel();
        }}
      />

      {/* Dialog Content */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Strip */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${badgeBgMap[variant]}`}>
              {iconMap[variant]}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Message */}
        <div className="px-5 py-2">
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900/60 mt-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="cursor-pointer rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmBtnMap[variant]}`}
          >
            {isLoading ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
