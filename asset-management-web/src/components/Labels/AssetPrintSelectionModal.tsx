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
  AlertCircle,
  Layers,
  CheckSquare,
  Square,
  Filter
} from 'lucide-react';
import type { Asset, AssetStatus } from '../../types/asset';
import { assetService } from '../../services/asset.service';

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
  const [statusFilter, setStatusFilter] = useState('');
  const [allSystemAssets, setAllSystemAssets] = useState<Asset[]>(initialAssets);
  const [loading, setLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Map ID -> Asset untuk menyimpan pilihan pengguna
  const [selectedMap, setSelectedMap] = useState<Map<number, Asset>>(new Map());

  // Inisialisasi daftar seluruh aset saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setStatusFilter('');
      setIsPreparing(false);
      setErrorMessage(null);
      loadAllSystemAssets();
    } else {
      setSelectedMap(new Map());
    }
  }, [isOpen]);

  // Mengambil SELURUH aset yang terdaftar di sistem (bukan hanya 1 halaman)
  const loadAllSystemAssets = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Ambil hingga 1000 aset master dari database
      const response = await assetService.getAll({ per_page: 1000 });
      setAllSystemAssets(response.data);
    } catch (err) {
      console.error('Gagal mengambil seluruh aset untuk cetak:', err);
      if (initialAssets.length > 0) {
        setAllSystemAssets(initialAssets);
      } else {
        setErrorMessage('Gagal memuat seluruh daftar aset dari server.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter aset lokal secara instan berdasarkan kata kunci pencarian dan filter status
  const filteredAssets = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return allSystemAssets.filter((a) => {
      // 1. Filter Status
      if (statusFilter && a.status !== statusFilter) {
        return false;
      }
      // 2. Filter Pencarian Teks
      if (!q) return true;
      const matchName = a.name.toLowerCase().includes(q);
      const matchCode = a.asset_code.toLowerCase().includes(q);
      const matchCategory = a.category?.name ? a.category.name.toLowerCase().includes(q) : false;
      const matchLocation = a.location?.name ? a.location.name.toLowerCase().includes(q) : false;
      return matchName || matchCode || matchCategory || matchLocation;
    });
  }, [allSystemAssets, searchTerm, statusFilter]);

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

  // Cek apakah seluruh aset di sistem sudah terpilih
  const isAllSystemSelected = useMemo(() => {
    if (allSystemAssets.length === 0) return false;
    return allSystemAssets.every((a) => selectedMap.has(a.id));
  }, [allSystemAssets, selectedMap]);

  // Cek apakah seluruh aset yang sedang tampil (hasil pencarian/filter) sudah terpilih
  const isAllFilteredSelected = useMemo(() => {
    if (filteredAssets.length === 0) return false;
    return filteredAssets.every((a) => selectedMap.has(a.id));
  }, [filteredAssets, selectedMap]);

  // Pilih Semua Aset di Seluruh Sistem
  const handleToggleSelectAllSystem = () => {
    if (isAllSystemSelected) {
      setSelectedMap(new Map());
    } else {
      const next = new Map<number, Asset>();
      allSystemAssets.forEach((a) => next.set(a.id, a));
      setSelectedMap(next);
    }
  };

  // Pilih Semua Aset di Hasil Pencarian/Filter Saat Ini
  const handleToggleSelectAllFiltered = () => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (isAllFilteredSelected) {
        filteredAssets.forEach((a) => next.delete(a.id));
      } else {
        filteredAssets.forEach((a) => next.set(a.id, a));
      }
      return next;
    });
  };

  const handleResetSelection = () => {
    setSelectedMap(new Map());
  };

  // Penanganan klik tombol cetak dengan loading halus (mencegah freeze saat ratusan aset dimuat)
  const handleProceed = () => {
    const selectedList = Array.from(selectedMap.values());
    if (selectedList.length === 0) return;
    
    setIsPreparing(true);
    // Beri jeda 180ms agar UI merender indikator animasi loading terlebih dahulu
    setTimeout(() => {
      onProceedToPrint(selectedList);
      setIsPreparing(false);
    }, 180);
  };

  // Estimasi jumlah lembar kertas A4
  const estimatedSheets2Col = Math.ceil(selectedMap.size / 10);
  const estimatedSheets3Col = Math.ceil(selectedMap.size / 18);

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
      <div className="relative z-10 flex flex-col w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1A2433] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Loading Overlay Saat Transisi Cetak */}
        {isPreparing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-[#1A2433]/95 backdrop-blur-xs p-6 text-center animate-in fade-in duration-150">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E6E1D6] bg-[#FAF7F2] text-[#1E3A5F] dark:border-slate-700 dark:bg-[#111822] dark:text-[#F4B752] shadow-xs">
              <Printer size={26} className="animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-[#2B4C6F] dark:text-[#FAF7F2]">
              Menyiapkan Lembar Label QR...
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Mengalokasikan {selectedMap.size} stiker ke dalam {estimatedSheets2Col} lembar format A4 presisi.
            </p>
            <div className="mt-4 w-48 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-[#1E3A5F] dark:bg-[#F4B752] rounded-full animate-pulse w-full" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E1D6] bg-[#FAF7F2]/60 px-6 py-4 dark:border-slate-800 dark:bg-[#151D2A]/60">
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
                  <span className="rounded-full bg-[#F4B752] px-2.5 py-0.5 text-[11px] font-bold text-slate-900 shadow-2xs">
                    {selectedMap.size} Terpilih
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Pilih aset dari seluruh sistem ({allSystemAssets.length} unit). Filter status dan kata kunci tersedia di bawah.
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

        {/* Toolbar Pencarian, Filter Status & Kontrol Pilihan */}
        <div className="border-b border-[#E6E1D6] bg-[#FAF7F2]/30 px-6 py-3.5 dark:border-slate-800 dark:bg-[#111822]/40 space-y-3">
          
          {/* Baris Input Pencarian & Dropdown Status */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Input Pencarian */}
            <div className="relative sm:col-span-7">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="Cari nama aset, kode inventaris, kategori, lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E1D6] bg-white py-2 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#151D2A] dark:text-slate-100 dark:focus:border-[#F4B752]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Filter Status */}
            <div className="sm:col-span-5 relative">
              <select
                aria-label="Filter status aset"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E6E1D6] bg-white px-3 text-xs text-slate-800 outline-none transition-all focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#151D2A] dark:text-slate-200 dark:focus:border-[#F4B752] cursor-pointer"
              >
                <option value="">Semua Status Operasional</option>
                <option value="tersedia">Tersedia (Ready)</option>
                <option value="rusak">Rusak</option>
                <option value="sedang diperbaiki">Sedang Diperbaiki</option>
                <option value="hilang">Hilang</option>
                <option value="dibuang">Dibuang</option>
                <option value="habis">Habis</option>
                <option value="kadaluarsa">Kadaluarsa</option>
                <option value="borrowed">Dipinjam (Legacy)</option>
                <option value="maintenance">Perawatan (Legacy)</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Pills untuk Status Populer */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            <span className="text-slate-400 shrink-0 text-[11px] font-medium flex items-center gap-1">
              <Filter size={11} />
              Filter Cepat:
            </span>
            {[
              { val: '', label: 'Semua Status' },
              { val: 'tersedia', label: 'Tersedia' },
              { val: 'rusak', label: 'Rusak' },
              { val: 'sedang diperbaiki', label: 'Diperbaiki' },
              { val: 'hilang', label: 'Hilang' },
            ].map((pill) => (
              <button
                key={pill.val}
                type="button"
                onClick={() => setStatusFilter(pill.val)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                  statusFilter === pill.val
                    ? 'border-[#1E3A5F] bg-[#1E3A5F] text-[#FAF7F2] dark:border-[#F4B752] dark:bg-[#F4B752] dark:text-slate-900 shadow-2xs font-semibold'
                    : 'border-[#E6E1D6] bg-white text-slate-600 hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#151D2A] dark:text-slate-300'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Baris Tombol Aksi Cepat */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tombol Pilih Semua Aset di Sistem */}
              <button
                type="button"
                onClick={handleToggleSelectAllSystem}
                disabled={allSystemAssets.length === 0}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                  isAllSystemSelected
                    ? 'border-[#1E3A5F] bg-[#1E3A5F] text-[#FAF7F2] dark:border-[#F4B752] dark:bg-[#F4B752] dark:text-slate-900'
                    : 'border-[#E6E1D6] bg-white text-slate-700 hover:bg-[#FAF7F2] hover:border-[#1E3A5F] dark:border-slate-700 dark:bg-[#151D2A] dark:text-slate-200'
                }`}
              >
                {isAllSystemSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                <span>
                  {isAllSystemSelected 
                    ? `Batalkan Semua Aset (${allSystemAssets.length})` 
                    : `Pilih Semua Aset Sistem (${allSystemAssets.length})`}
                </span>
              </button>

              {/* Tombol Pilih Semua Hasil Filter jika sedang memfilter */}
              {(searchTerm || statusFilter) && filteredAssets.length > 0 && filteredAssets.length !== allSystemAssets.length && (
                <button
                  type="button"
                  onClick={handleToggleSelectAllFiltered}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E6E1D6] bg-white text-slate-700 hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#151D2A] dark:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  <span>
                    {isAllFilteredSelected 
                      ? 'Batal Pilih Hasil Filter' 
                      : `Pilih Hasil Filter (${filteredAssets.length} unit)`}
                  </span>
                </button>
              )}
            </div>

            {selectedMap.size > 0 && (
              <button
                type="button"
                onClick={handleResetSelection}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:underline dark:text-rose-400 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset Pilihan ({selectedMap.size})</span>
              </button>
            )}
          </div>
        </div>

        {/* Daftar Item Aset dengan Checkbox */}
        <div className="flex-1 overflow-y-auto px-6 py-3 divide-y divide-[#EFECE6] dark:divide-slate-800/70 min-h-[260px] max-h-[48vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#1E3A5F] dark:border-slate-700 dark:border-t-[#F4B752]" />
              <p className="text-xs font-medium">Memuat seluruh inventaris aset dari server...</p>
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <AlertCircle size={24} className="mb-2 text-rose-500" />
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMessage}</p>
              <button
                type="button"
                onClick={loadAllSystemAssets}
                className="mt-3 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] px-3 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E1D6] bg-[#FAF7F2] text-slate-400 dark:border-slate-800 dark:bg-[#111822]">
                <Package size={20} />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada aset yang sesuai kriteria
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {searchTerm || statusFilter 
                  ? 'Coba sesuaikan kata kunci pencarian atau ubah filter status operasional.' 
                  : 'Belum ada aset terdaftar di sistem.'}
              </p>
            </div>
          ) : (
            filteredAssets.map((asset) => {
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

        {/* Footer / Aksi Bawah & Estimasi Kertas */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E6E1D6] bg-[#FAF7F2]/60 px-6 py-4 dark:border-slate-800 dark:bg-[#151D2A]/60">
          <div>
            {selectedMap.size === 0 ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">Pilih minimal 1 aset untuk melanjutkan ke pencetakan.</span>
            ) : (
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Total <strong className="font-mono text-[#1E3A5F] dark:text-[#F4B752] font-bold">{selectedMap.size}</strong> aset dipilih dari {allSystemAssets.length} unit sistem.
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Layers size={12} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                  <span>Otomatis dialokasikan menjadi: </span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {estimatedSheets2Col} lembar A4
                  </strong>
                  <span className="text-slate-400">(2 kolom / 10 stiker)</span>
                  <span>atau</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {estimatedSheets3Col} lembar A4
                  </strong>
                  <span className="text-slate-400">(3 kolom / 18 stiker)</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPreparing}
              className="inline-flex min-h-[38px] items-center justify-center rounded-xl border border-[#E6E1D6] bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#FAF7F2] disabled:opacity-50 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedMap.size === 0 || isPreparing}
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-xs transition-all hover:bg-[#162D4A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1E3A5F] dark:hover:bg-[#25456f] cursor-pointer"
            >
              {isPreparing ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Menyiapkan...</span>
                </>
              ) : (
                <>
                  <Printer size={14} className="text-[#F4B752]" />
                  <span>
                    {selectedMap.size > 0 
                      ? `Cetak Label QR (${selectedMap.size})` 
                      : 'Cetak Label QR'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
