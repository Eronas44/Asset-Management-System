import React, { useState, useEffect } from 'react';
import { 
  X, Handshake, Calendar, User, FileText, CheckCircle2, 
  AlertCircle, Loader2
} from 'lucide-react';
import { assetBorrowingService } from '../../services/asset-borrowing.service';
import type { Asset } from '../../types/asset';

interface QuickBorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSuccess?: (borrowerName: string) => void;
}

export const QuickBorrowModal: React.FC<QuickBorrowModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess
}) => {

  const [borrowerName, setBorrowerName] = useState('');
  const [expectedReturnAt, setExpectedReturnAt] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper untuk format tanggal ke input datetime-local: YYYY-MM-DDTHH:mm
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  // Set default expected return (misal besok jam 17:00) saat modal dibuka
  useEffect(() => {
    if (isOpen && asset) {
      setBorrowerName('');
      setNotes('');
      setErrorMessage(null);
      setIsSuccess(false);

      // Default: besok jam 17:00
      const defaultReturn = new Date();
      defaultReturn.setDate(defaultReturn.getDate() + 1);
      defaultReturn.setHours(17, 0, 0, 0);
      setExpectedReturnAt(formatDateTimeLocal(defaultReturn));
    }
  }, [isOpen, asset]);

  if (!isOpen || !asset) return null;

  // Preset durasi peminjaman cepat
  const applyPresetDays = (days: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(17, 0, 0, 0);
    setExpectedReturnAt(formatDateTimeLocal(targetDate));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!borrowerName.trim()) {
      setErrorMessage('Nama peminjam wajib diisi.');
      return;
    }

    if (!expectedReturnAt) {
      setErrorMessage('Rencana waktu pengembalian wajib ditentukan.');
      return;
    }

    const formatDateTime = (value: Date) => {
      const pad = (input: number) => String(input).padStart(2, '0');
      return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
    };

    const formatDateTimeInput = (value: string) => {
      if (!value) return '';
      return `${value.replace('T', ' ')}:00`;
    };

    setIsSubmitting(true);

    try {
      const borrowedAt = formatDateTime(new Date());

      await assetBorrowingService.create({
        asset_id: Number(asset.id),
        borrower_name: borrowerName.trim(),
        borrowed_at: borrowedAt,
        expected_return_at: formatDateTimeInput(expectedReturnAt),
        notes: notes.trim() || undefined
      });

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(borrowerName.trim());
      }

      // Auto close setelah 1.8 detik sukses
      setTimeout(() => {
        onClose();
      }, 1800);

    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg = apiErr?.response?.data?.message || 'Gagal menyimpan transaksi peminjaman. Silakan coba lagi.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#090D16]/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white shadow-xl dark:border-slate-800 dark:bg-[#1A2433] animate-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#E6E1D6] px-5 py-4 bg-[#FAF7F2]/60 dark:border-slate-800 dark:bg-[#111822]/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1E3A5F] border border-[#E6E1D6] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 shadow-2xs">
              <Handshake size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2B4C6F] dark:text-[#FAF7F2] tracking-tight">
                Formulir Peminjaman Aset
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pencatatan sirkulasi atas aset hasil pemindaian QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer rounded-xl text-slate-400 hover:bg-[#FAF7F2] hover:text-[#2B4C6F] dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
          
          {/* Card Info Aset Terpilih */}
          <div className="rounded-2xl border border-[#E6E1D6] bg-[#FAF7F2]/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#1E3A5F] bg-white px-2 py-0.5 rounded-md border border-[#E6E1D6] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                  {asset.asset_code}
                </span>
                <h4 className="text-xs font-bold text-[#2B4C6F] dark:text-slate-100 mt-1.5">
                  {asset.name}
                </h4>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400">
                {asset.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-[#E6E1D6] dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400">Kategori: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{asset.category?.name || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Lokasi: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{asset.location?.name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Kondisi Jika Sukses */}
          {isSuccess ? (
            <div className="py-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-sm">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2B4C6F] dark:text-slate-100">
                  Peminjaman Berhasil Dicatat!
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Unit <span className="font-bold text-slate-800 dark:text-slate-200">{asset.name}</span> kini tercatat dipinjam oleh <span className="font-bold text-slate-800 dark:text-slate-200">{borrowerName}</span>.
                </p>
                <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Menutup formulir dan kembali ke hasil scan...
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#E6E1D6] bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Tutup Sekarang
                </button>
              </div>
            </div>
          ) : (
            /* Formulir Peminjaman */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {errorMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nama Lengkap Peminjam <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso (Divisi TI / Operasional)"
                    className="w-full rounded-xl border border-[#E6E1D6] bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Rencana Batas Waktu Pengembalian <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => applyPresetDays(1)}
                      className="rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      +1 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetDays(3)}
                      className="rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      +3 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetDays(7)}
                      className="rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      +7 Hari
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Calendar size={15} />
                  </div>
                  <input
                    type="datetime-local"
                    required
                    value={expectedReturnAt}
                    onChange={(e) => setExpectedReturnAt(e.target.value)}
                    className="w-full rounded-xl border border-[#E6E1D6] bg-white py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition-all focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Keperluan & Catatan Tambahan
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute top-2.5 left-3 text-slate-400">
                    <FileText size={15} />
                  </div>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan kondisi unit, kegiatan pemakaian, atau nomor kontak peminjam..."
                    className="w-full rounded-xl border border-[#E6E1D6] bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6E1D6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="min-h-[38px] rounded-xl border border-[#E6E1D6] bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A5F] px-4 py-1.5 text-xs font-semibold text-[#FAF7F2] shadow-sm hover:bg-[#162D4A] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 disabled:opacity-60 cursor-pointer transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Handshake size={14} />
                      <span>Konfirmasi & Pinjamkan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
