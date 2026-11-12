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
    info: <Info size={22} className="text-[#1E3A5F] dark:text-[#F4B752]" />,
  };

  const badgeBgMap = {
    danger: 'bg-rose-50 border-rose-200/80 dark:bg-rose-950/40 dark:border-rose-900/50',
    warning: 'bg-amber-50 border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-900/50',
    info: 'bg-[#FAF7F2] border-[#E6E1D6] dark:bg-[#111822] dark:border-slate-800',
  };

  const confirmBtnMap = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/30',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/30',
    info: 'bg-[#1E3A5F] hover:bg-[#162D4A] text-[#FAF7F2] focus:ring-[#1E3A5F]/20 dark:bg-[#1E3A5F] dark:hover:bg-[#25456f]',
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
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white shadow-xl dark:border-slate-800 dark:bg-[#1A2433] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Strip */}
        <div className="flex items-start justify-between p-5 pb-3 bg-[#FAF7F2]/40 dark:bg-[#151D2A]/40 border-b border-[#E6E1D6] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${badgeBgMap[variant]} shadow-2xs`}>
              {iconMap[variant]}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B4C6F] dark:text-[#FAF7F2]">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer rounded-xl text-slate-400 hover:bg-[#FAF7F2] hover:text-[#1E3A5F] dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Message */}
        <div className="px-5 py-4">
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-[#E6E1D6] bg-[#FAF7F2]/60 px-5 py-3.5 dark:border-slate-800 dark:bg-[#151D2A]/60">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="min-h-[38px] cursor-pointer rounded-xl border border-[#E6E1D6] bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#FAF7F2] transition-colors dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`min-h-[38px] inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold shadow-xs transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmBtnMap[variant]}`}
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
