import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, 
  Search, 
  X, 
  Package, 
  QrCode, 
  MapPin, 
  Tag, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import type { Asset, AssetStatus } from '../../types/asset';
import { assetService } from '../../services/asset.service';
import { useDebounce } from '../../utils/useDebounce';

interface AssetPrintSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPrint: (selectedAssets: Asset[]) => void;
  initialAssets?: Asset[];
}

const statusBadgeStyles: Record<AssetStatus, string> = {
  available: 'border-emerald-800/20 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300',
  borrowed: 'border-amber-800/20 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300',
  maintenance: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  retired: 'border-rose-800/20 bg-rose-50/80 text-rose-800 dark:border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300',
  tersedia: 'border-emerald-800/20 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300',
  rusak: 'border-rose-800/20 bg-rose-50/80 text-rose-800 dark:border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300',
  'sedang diperbaiki': 'border-amber-800/20 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300',
  hilang: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  dibuang: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  habis: 'border-amber-800/20 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300',
  kadaluarsa: 'border-rose-800/20 bg-rose-50/80 text-rose-800 dark:border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300'
};

const statusLabels: Record<AssetStatus, string> = {
  available: 'Tersedia',
  borrowed: 'Dipinjam',
  maintenance: 'Perawatan',
  retired: 'Pensiun',
  tersedia: 'Tersedia',
  rusak: 'Rusak',
  'sedang diperbaiki': 'Diperbaiki',
  hilang: 'Hilang',
  dibuang: 'Dibuang',
  habis: 'Habis',
  kadaluarsa: 'Kadaluarsa'
};

export const AssetPrintSelectionModal: React.FC<AssetPrintSelectionModalProps> = ({
  isOpen,
  onClose,
  onProceedToPrint,
  initialAssets = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [availableAssets, setAvailableAssets] = useState<Asset[]>(initialAssets);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Map ID -> Asset untuk menyimpan pilihan pengguna
  const [selectedMap, setSelectedMap] = useState<Map<number, Asset>>(new Map());

  // Inisialisasi daftar aset saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setErrorMessage(null);
      // Gunakan initialAssets terlebih dahulu jika tersedia
      if (initialAssets.length > 0) {
        setAvailableAssets(initialAssets);
      }
      // Muat daftar aset terkini dari API
      loadAssets('');
    } else {
      setSelectedMap(new Map());
    }
  }, [isOpen]);

  // Efek pencarian dengan debounce
  useEffect(() => {
    if (!isOpen) return;
    loadAssets(debouncedSearch);
  }, [debouncedSearch]);

  const loadAssets = async (searchQuery: string) => {
    // Jika tidak ada query pencarian dan sudah ada initialAssets, langsung gunakan
    if (!searchQuery.trim() && initialAssets.length > 0) {
      setAvailableAssets(initialAssets);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await assetService.getAll({
        search: searchQuery.trim() || undefined,
        per_page: 50
      });
      setAvailableAssets(response.data);
    } catch (err) {
      console.error('Gagal mengambil daftar aset untuk cetak:', err);
      setErrorMessage('Gagal memuat daftar aset dari server.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle pilihan aset per item
  const handleToggleAsset = (asset: Asset) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(asset.id)) {
        next.delete(asset.id);
      } else {
        next.set(asset.id, asset);
      }
      return next;
    });
  };

  // Toggle Pilih Semua pada daftar yang sedang ditampilkan
  const isAllCurrentSelected = useMemo(() => {
    if (availableAssets.length === 0) return false;
    return availableAssets.every((a) => selectedMap.has(a.id));
  }, [availableAssets, selectedMap]);

  const handleToggleSelectAll = () => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (isAllCurrentSelected) {
        availableAssets.forEach((a) => next.delete(a.id));
      } else {
        availableAssets.forEach((a) => next.set(a.id, a));
      }
      return next;
    });
  };

  const handleResetSelection = () => {
    setSelectedMap(new Map());
  };

  const handleProceed = () => {
    const selectedList = Array.from(selectedMap.values());
    if (selectedList.length === 0) return;
    onProceedToPrint(selectedList);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup jendela pemilih aset"
        onClick={onClose}
        className="absolute inset-0 bg-[#090D16]/70 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1A2433] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E1D6] bg-[#FAF7F2]/60 px-6 py-4.5 dark:border-slate-800 dark:bg-[#151D2A]/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E6E1D6] bg-[#FAF7F2] text-[#1E3A5F] dark:border-slate-700 dark:bg-[#111822] dark:text-[#F4B752]">
              <Printer size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#2B4C6F] dark:text-[#FAF7F2]">
                  Pilih Aset untuk Cetak Label QR
                </h3>
                {selectedMap.size > 0 && (
                  <span className="rounded-full bg-[#F4B752] px-2.5 py-0.5 text-[11px] font-bold text-slate-900">
                    {selectedMap.size} Terpilih
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Centang aset yang ingin dicetak lembar stikernya, lalu klik tombol Cetak di bawah.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E6E1D6] text-slate-400 hover:bg-[#FAF7F2] hover:text-[#1E3A5F] dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar Pencarian & Kontrol Pilihan */}
        <div className="border-b border-[#E6E1D6] bg-[#FAF7F2]/30 px-6 py-3.5 dark:border-slate-800 dark:bg-[#111822]/40 space-y-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama aset, kode inventaris (misal: AST-2026-0001), atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#E6E1D6] bg-white py-2 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#151D2A] dark:text-slate-100 dark:focus:border-[#F4B752]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Baris Status Pilihan & Pilih Semua */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isAllCurrentSelected}
                onChange={handleToggleSelectAll}
                disabled={availableAssets.length === 0}
                className="h-4 w-4 rounded border-slate-300 text-[#1E3A5F] focus:ring-[#1E3A5F] cursor-pointer disabled:cursor-not-allowed"
              />
              <span>
                {isAllCurrentSelected ? 'Batalkan Pilih Semua di Hasil Ini' : 'Pilih Semua di Hasil Ini'}
              </span>
              <span className="text-slate-400">({availableAssets.length} unit)</span>
            </label>

            {selectedMap.size > 0 && (
              <button
                type="button"
                onClick={handleResetSelection}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:underline dark:text-rose-400"
              >
                <RotateCcw size={12} />
                <span>Reset Pilihan ({selectedMap.size})</span>
              </button>
            )}
          </div>
        </div>

        {/* Daftar Item Aset dengan Checkbox */}
        <div className="flex-1 overflow-y-auto px-6 py-3 divide-y divide-[#EFECE6] dark:divide-slate-800/70 min-h-[260px] max-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#1E3A5F] dark:border-slate-700 dark:border-t-[#F4B752]" />
              <p className="text-xs font-medium">Mencari data aset inventaris...</p>
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <AlertCircle size={24} className="mb-2 text-rose-500" />
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMessage}</p>
              <button
                type="button"
                onClick={() => loadAssets(debouncedSearch)}
                className="mt-3 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] px-3 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Coba Lagi
              </button>
            </div>
          ) : availableAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E1D6] bg-[#FAF7F2] text-slate-400 dark:border-slate-800 dark:bg-[#111822]">
                <Package size={20} />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada aset yang sesuai
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {searchTerm ? `Tidak ditemukan data untuk "${searchTerm}"` : 'Belum ada aset terdaftar di sistem.'}
              </p>
            </div>
          ) : (
            availableAssets.map((asset) => {
              const isChecked = selectedMap.has(asset.id);
              return (
                <div
                  key={asset.id}
                  onClick={() => handleToggleAsset(asset)}
                  className={`group flex items-center justify-between gap-3 py-3 px-3 -mx-3 rounded-xl transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-[#FAF7F2] dark:bg-[#151D2A]'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // dikendalikan oleh onClick div container
                      className="h-4 w-4 rounded border-slate-300 text-[#1E3A5F] focus:ring-[#1E3A5F] cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-[#1E3A5F] dark:group-hover:text-[#F4B752] transition-colors">
                          {asset.name}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-[#111822] px-1.5 py-0.5 rounded border border-[#E6E1D6] dark:border-slate-800">
                          {asset.asset_code}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Tag size={11} className="text-slate-400" />
                          <span>{asset.category?.name || 'Tanpa Kategori'}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} className="text-slate-400" />
                          <span>{asset.location?.name || 'Tanpa Lokasi'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${statusBadgeStyles[asset.status] || statusBadgeStyles.tersedia}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      <span>{statusLabels[asset.status] || asset.status}</span>
                    </span>
                    <div className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg border border-[#E6E1D6] bg-white text-slate-400 dark:border-slate-700 dark:bg-[#111822]">
                      <QrCode size={14} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Aksi Bawah */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E6E1D6] bg-[#FAF7F2]/60 px-6 py-4 dark:border-slate-800 dark:bg-[#151D2A]/60">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {selectedMap.size === 0 ? (
              <span>Pilih minimal 1 aset untuk melanjutkan.</span>
            ) : (
              <span>
                Total <strong className="font-mono text-slate-900 dark:text-slate-100 font-bold">{selectedMap.size}</strong> aset siap dicetak label QR-nya.
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[38px] items-center justify-center rounded-xl border border-[#E6E1D6] bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedMap.size === 0}
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-xs transition-all hover:bg-[#162D4A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1E3A5F] dark:hover:bg-[#25456f] cursor-pointer"
            >
              <Printer size={14} className="text-[#F4B752]" />
              <span>
                {selectedMap.size > 0 
                  ? `Cetak Label QR (${selectedMap.size})` 
                  : 'Cetak Label QR'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
