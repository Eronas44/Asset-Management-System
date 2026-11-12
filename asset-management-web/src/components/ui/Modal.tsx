import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  maxWidthClassName = 'max-w-3xl'
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0 bg-[#090D16]/70 backdrop-blur-md transition-opacity"
      />
      <div className={`relative z-10 w-full ${maxWidthClassName} overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white shadow-xl dark:border-slate-800 dark:bg-[#1A2433] flex flex-col animate-in fade-in zoom-in-95 duration-150`}>
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E1D6] bg-[#FAF7F2]/40 px-6 py-4 dark:border-slate-800 dark:bg-[#151D2A]/40">
          <div>
            <h3 className="text-base font-bold text-[#2B4C6F] dark:text-[#FAF7F2] tracking-tight">{title}</h3>
            {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-xl border border-[#E6E1D6] text-slate-500 transition-colors hover:bg-[#FAF7F2] hover:text-[#1E3A5F] dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className={`overflow-y-auto px-6 py-5 ${footer ? 'max-h-[68vh]' : 'max-h-[82vh]'}`}>
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-[#E6E1D6] bg-[#FAF7F2]/60 px-6 py-3.5 dark:border-slate-800 dark:bg-[#151D2A]/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
