import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assetService } from '../../services/asset.service';
import type { AssetFilterParams } from '../../services/asset.service';
import { assetCategoryService } from '../../services/asset-category.service';
import { assetLocationService } from '../../services/asset-location.service';
import type { Asset, AssetStatus, AssetType } from '../../types/asset';
import type { AssetCategory } from '../../types/asset-category';
import type { AssetLocation } from '../../types/asset-location';
import { formatRupiah } from '../../utils/format';
import Modal from '../../components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, Plus, CheckCircle2, AlertCircle, Search, Filter, 
  FileText, FileSpreadsheet, ChevronLeft, ChevronRight, 
  ExternalLink, Eye, Info, Pencil, Trash2, Printer
} from 'lucide-react';
import { useDebounce } from '../../utils/useDebounce';
import { useToast } from '../../components/Feedback/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const BatchQrPrintModal = React.lazy(() => 
  import('../../components/Labels/BatchQrPrintModal').then(m => ({ default: m.BatchQrPrintModal }))
);

const assetStatusOptions: Record<AssetType, Array<{ value: AssetStatus; label: string }>> = {
  single: [
    { value: 'tersedia', label: 'Tersedia' },
    { value: 'rusak', label: 'Rusak' },
    { value: 'sedang diperbaiki', label: 'Sedang Diperbaiki' },
    { value: 'hilang', label: 'Hilang' },
    { value: 'dibuang', label: 'Dibuang' }
  ],
  bulk: [
    { value: 'tersedia', label: 'Tersedia' },
    { value: 'habis', label: 'Habis' },
    { value: 'hilang', label: 'Hilang' },
    { value: 'kadaluarsa', label: 'Kadaluarsa' }
  ]
};

const assetFilterStatusOptions: Array<{ value: AssetStatus; label: string }> = [
  { value: 'available', label: 'Available (legacy)' },
  { value: 'borrowed', label: 'Borrowed (legacy)' },
  { value: 'maintenance', label: 'Maintenance (legacy)' },
  { value: 'retired', label: 'Retired (legacy)' },
  { value: 'tersedia', label: 'Tersedia' },
  { value: 'rusak', label: 'Rusak' },
  { value: 'sedang diperbaiki', label: 'Sedang Diperbaiki' },
  { value: 'hilang', label: 'Hilang' },
  { value: 'dibuang', label: 'Dibuang' },
  { value: 'habis', label: 'Habis' },
  { value: 'kadaluarsa', label: 'Kadaluarsa' }
];

const statusStyleMap: Record<AssetStatus, string> = {
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

const statusLabelMap: Record<AssetStatus, string> = {
  available: 'Available',
  borrowed: 'Borrowed',
  maintenance: 'Maintenance',
  retired: 'Retired',
  tersedia: 'Tersedia',
  rusak: 'Rusak',
  'sedang diperbaiki': 'Sedang Diperbaiki',
  hilang: 'Hilang',
  dibuang: 'Dibuang',
  habis: 'Habis',
  kadaluarsa: 'Kadaluarsa'
};

const typeLabelMap: Record<AssetType, string> = {
  single: 'Aset Tunggal',
  bulk: 'Aset Berkelompok'
};

const AssetPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const toast = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [locations, setLocations] = useState<AssetLocation[]>([]);

  // State pencarian terpisah untuk mendukung debouncing
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  // Dialog Konfirmasi Hapus Aset
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // State Terpadu untuk Filter dan Paginasi
  const [filters, setFilters] = useState<AssetFilterParams>({
    search: '',
    status: '',
    asset_category_id: '',
    asset_location_id: '',
    page: 1,
    per_page: 10
  });

  // Sinkronisasi otomatis nilai debounced search ke parameter filters
  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === debouncedSearch) return prev;
      return { ...prev, search: debouncedSearch, page: 1 };
    });
  }, [debouncedSearch]);

  // State Metadata Paginasi dari API
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  // Form State untuk Tambah Aset
  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('single');
  const [quantity, setQuantity] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [usefulLifeYears, setUsefulLifeYears] = useState<number>(5);
  const [residualValue, setResidualValue] = useState<number>(0);
  const [status, setStatus] = useState<AssetStatus>('tersedia');
  const [notes, setNotes] = useState('');
  const [exportLoading, setExportLoading] = useState<{ csv: boolean; pdf: boolean }>({ csv: false, pdf: false });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State untuk Edit Aset
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editAssetCode, setEditAssetCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editAssetType, setEditAssetType] = useState<AssetType>('single');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editCategoryId, setEditCategoryId] = useState<number | ''>('');
  const [editLocationId, setEditLocationId] = useState<number | ''>('');
  const [editPurchaseDate, setEditPurchaseDate] = useState('');
  const [editPurchasePrice, setEditPurchasePrice] = useState<number>(0);
  const [editUsefulLifeYears, setEditUsefulLifeYears] = useState<number>(5);
  const [editResidualValue, setEditResidualValue] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<AssetStatus>('tersedia');
  const [editNotes, setEditNotes] = useState('');

  // Batch Selection & Print Label States
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [singlePrintAsset, setSinglePrintAsset] = useState<Asset | null>(null);

  const handleToggleSelectAsset = (id: number) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    if (selectedAssetIds.length === assets.length && assets.length > 0) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(assets.map((a) => a.id));
    }
  };

  const handleOpenSinglePrint = (asset: Asset) => {
    setSinglePrintAsset(asset);
    setIsBatchPrintOpen(true);
  };

  const handleOpenBatchPrint = () => {
    setSinglePrintAsset(null);
    setIsBatchPrintOpen(true);
  };

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Ambil data Dropdown
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [categoriesData, locationsData] = await Promise.all([
          assetCategoryService.getAll(),
          assetLocationService.getAll()
        ]);
        setCategories(categoriesData);
        setLocations(locationsData);
      } catch (err) {
        console.error('Gagal memuat master data dropdown:', err);
      }
    };
    loadDropdownData();
  }, []);

  // Ambil data tabel aset
  const fetchAssetsData = async () => {
    setLoading(true);
    try {
      const response = await assetService.getAll(filters);
      setAssets(response.data);
      setPaginationMeta({
        current_page: response.meta.current_page,
        last_page: response.meta.last_page,
        total: response.meta.total
      });
    } catch (err) {
      console.error('Gagal memuat data aset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsData();
  }, [filters]);

  const handleFilterChange = (field: keyof AssetFilterParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage
    }));
  };

  const triggerDownload = (blobData: Blob, fileExtension: 'csv' | 'pdf') => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `assets-report-${dateStr}.${fileExtension}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const handleExportCsv = async () => {
    setExportLoading((prev) => ({ ...prev, csv: true }));
    try {
      const data = await assetService.exportCsv(filters);
      triggerDownload(data, 'csv');
      toast.success('Laporan inventaris CSV berhasil diunduh.');
    } catch (err) {
      console.error('Gagal mengekspor CSV:', err);
      toast.error('Gagal mengunduh laporan CSV.');
    } finally {
      setExportLoading((prev) => ({ ...prev, csv: false }));
    }
  };

  const handleExportPdf = async () => {
    setExportLoading((prev) => ({ ...prev, pdf: true }));
    try {
      const data = await assetService.exportPdf(filters);
      triggerDownload(data, 'pdf');
      toast.success('Laporan inventaris PDF berhasil diunduh.');
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
      toast.error('Gagal mengunduh laporan PDF.');
    } finally {
      setExportLoading((prev) => ({ ...prev, pdf: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!categoryId || !locationId) {
      const errMsg = 'Kategori dan Lokasi wajib dipilih.';
      setMessage({ text: errMsg, isError: true });
      toast.error(errMsg);
      return;
    }

    if (Number(residualValue) > Number(purchasePrice)) {
      const errMsg = 'Nilai residu tidak boleh lebih besar dari harga perolehan.';
      setMessage({ text: errMsg, isError: true });
      toast.error(errMsg);
      return;
    }

    setSubmitLoading(true);
    try {
      await assetService.create({
        asset_code: assetCode,
        name,
        type: assetType,
        quantity: assetType === 'single' ? 1 : quantity,
        asset_category_id: Number(categoryId),
        asset_location_id: Number(locationId),
        purchase_date: purchaseDate,
        purchase_price: Number(purchasePrice),
        useful_life_years: Number(usefulLifeYears),
        residual_value: Number(residualValue),
        status,
        notes
      });

      setMessage({ text: 'Aset baru berhasil ditambahkan!', isError: false });
      toast.success('Aset baru berhasil didaftarkan ke inventaris!');
      
      setAssetCode('');
      setName('');
      setAssetType('single');
      setQuantity(1);
      setCategoryId('');
      setLocationId('');
      setPurchaseDate('');
      setPurchasePrice(0);
      setStatus('tersedia');
      setNotes('');
      setIsCreateModalOpen(false);

      fetchAssetsData();
    } catch (err: any) {
      console.error(err);
      const errText = err.response?.data?.message || 'Gagal menambahkan aset baru.';
      setMessage({ text: errText, isError: true });
      toast.error(errText);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (asset: Asset) => {
    setDeletingAsset(asset);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return;
    setDeleteLoading(true);
    try {
      await assetService.delete(deletingAsset.id);
      toast.success(`Aset "${deletingAsset.name}" berhasil dihapus.`);
      setIsDeleteDialogOpen(false);
      setDeletingAsset(null);
      fetchAssetsData();
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const errText = apiErr.response?.data?.message || 'Gagal menghapus data aset.';
      toast.error(errText);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditAssetCode(asset.asset_code);
    setEditName(asset.name);
    setEditAssetType((asset.type as AssetType) || 'single');
    setEditQuantity(asset.quantity ?? 1);
    setEditCategoryId(asset.asset_category_id || (asset.category?.id ?? ''));
    setEditLocationId(asset.asset_location_id || (asset.location?.id ?? ''));
    setEditPurchaseDate(asset.purchase_date ? asset.purchase_date.slice(0, 10) : '');
    setEditPurchasePrice(Number(asset.purchase_price) || 0);
    setEditUsefulLifeYears(Number(asset.useful_life_years) || 5);
    setEditResidualValue(Number(asset.residual_value) || 0);
    setEditStatus((asset.status as AssetStatus) || 'tersedia');
    setEditNotes(asset.notes || '');
    setMessage(null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    setMessage(null);

    if (!editCategoryId || !editLocationId) {
      const errMsg = 'Kategori dan Lokasi wajib dipilih.';
      setMessage({ text: errMsg, isError: true });
      toast.error(errMsg);
      return;
    }

    if (Number(editResidualValue) > Number(editPurchasePrice)) {
      const errMsg = 'Nilai residu tidak boleh lebih besar dari harga perolehan.';
      setMessage({ text: errMsg, isError: true });
      toast.error(errMsg);
      return;
    }

    setSubmitLoading(true);
    try {
      await assetService.update(editingAsset.id, {
        asset_code: editAssetCode,
        name: editName,
        type: editAssetType,
        quantity: editAssetType === 'single' ? 1 : Number(editQuantity),
        asset_category_id: Number(editCategoryId),
        asset_location_id: Number(editLocationId),
        purchase_date: editPurchaseDate,
        purchase_price: Number(editPurchasePrice),
        useful_life_years: Number(editUsefulLifeYears),
        residual_value: Number(editResidualValue),
        status: editStatus,
        notes: editNotes || undefined
      });

      setMessage({ text: `Aset "${editName}" berhasil diperbarui.`, isError: false });
      toast.success(`Data aset "${editName}" berhasil diperbarui.`);
      setIsEditModalOpen(false);
      fetchAssetsData();
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const errText = apiErr.response?.data?.message || 'Gagal memperbarui data aset.';
      setMessage({ text: errText, isError: true });
      toast.error(errText);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E6E1D6] pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#2B4C6F] dark:text-[#FAF7F2]">
              Inventaris Aset Perusahaan
            </h1>
            <span className="rounded-full bg-[#F4B752] px-2.5 py-0.5 text-xs font-semibold text-slate-900">
              Buku Inventaris
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pusat kendali inventaris, valuasi fiskal, status operasional, dan depresiasi aset tetap & lancar.
          </p>
        </div>
        {hasPermission('manage-assets') && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2.5 text-xs font-semibold tracking-wider text-[#FAF7F2] shadow-xs transition-all hover:bg-[#162D4A] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:bg-[#1E3A5F] dark:hover:bg-[#25456f]"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah Aset</span>
          </button>
        )}
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-xs transition-all ${
            message.isError
              ? 'border-rose-500/30 bg-rose-50/80 text-rose-900 dark:border-rose-500/25 dark:bg-rose-950/30 dark:text-rose-200'
              : 'border-emerald-500/30 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-950/30 dark:text-emerald-200'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {message.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          </div>
          <p className="leading-relaxed font-medium">{message.text}</p>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-[#E6E1D6] bg-white p-4 dark:border-slate-800 dark:bg-[#1A2433] shadow-xs">
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#2B4C6F] dark:text-[#FAF7F2]">
          <Filter size={13} className="text-[#1E3A5F] dark:text-[#F4B752]" />
          <span>Penyaringan Data</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
          <div className="relative lg:col-span-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={14} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari kode atau nama aset..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-100 dark:focus:border-[#F4B752]"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="h-10 w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 text-xs text-slate-800 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:focus:border-[#F4B752]"
            >
              <option value="">Semua Status Operasional</option>
              {assetFilterStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              value={filters.asset_category_id}
              onChange={(e) => handleFilterChange('asset_category_id', e.target.value ? Number(e.target.value) : '')}
              className="h-10 w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 text-xs text-slate-800 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:focus:border-[#F4B752]"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={filters.asset_location_id}
              onChange={(e) => handleFilterChange('asset_location_id', e.target.value ? Number(e.target.value) : '')}
              className="h-10 w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 text-xs text-slate-800 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:focus:border-[#F4B752]"
            >
              <option value="">Semua Lokasi</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Inventaris Aset */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white dark:border-slate-800 dark:bg-[#1A2433] shadow-xs">
        
        {/* Table Top Toolbar */}
        <div className="flex flex-col justify-between gap-3 border-b border-[#E6E1D6] p-4 sm:flex-row sm:items-center dark:border-slate-800 bg-[#FAF7F2]/40 dark:bg-[#151D2A]/40">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B4C6F] dark:text-[#FAF7F2]">
              Daftar Aset & Valuasi Buku
            </h2>
            <span className="rounded-md border border-[#E6E1D6] bg-[#FAF7F2] px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300">
              {paginationMeta.total} Unit Terdaftar
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenBatchPrint}
              disabled={assets.length === 0}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                selectedAssetIds.length > 0
                  ? 'border-[#1E3A5F] bg-[#1E3A5F] text-[#FAF7F2] hover:bg-[#162D4A]'
                  : 'border-[#E6E1D6] bg-white text-slate-700 hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200'
              }`}
              title="Cetak lembar stiker QR Code untuk unit aset"
            >
              <Printer size={14} className={selectedAssetIds.length > 0 ? 'text-[#F4B752]' : 'text-slate-600 dark:text-slate-400'} />
              <span>
                {selectedAssetIds.length > 0 
                  ? `Cetak Label QR (${selectedAssetIds.length})` 
                  : 'Cetak Label Halaman Ini'}
              </span>
            </button>

            {hasPermission('view-reports') && (
              <>
                <button 
                  onClick={handleExportCsv} 
                  disabled={exportLoading.csv}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {exportLoading.csv ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800 dark:border-slate-600 dark:border-t-slate-200" />
                  ) : (
                    <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span>Ekspor CSV</span>
                </button>
                <button 
                  onClick={handleExportPdf} 
                  disabled={exportLoading.pdf}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {exportLoading.pdf ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800 dark:border-slate-600 dark:border-t-slate-200" />
                  ) : (
                    <FileText size={14} className="text-rose-600 dark:text-rose-400" />
                  )}
                  <span>Ekspor PDF</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#1E3A5F] dark:border-slate-700 dark:border-t-[#F4B752]" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sinkronisasi data inventaris aset...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E6E1D6] bg-[#FAF7F2] text-slate-500 dark:border-slate-800 dark:bg-[#111822] dark:text-slate-400">
                <Package size={22} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2B4C6F] dark:text-[#FAF7F2]">
                Tidak Ada Catatan Aset
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Tidak ditemukan data yang sesuai dengan kriteria filter, atau belum ada aset yang terdaftar dalam buku master.
              </p>
            </div>
          ) : (
            <>
              {/* Tampilan Kartu Khusus Layar Mobile (< md) */}
              <div className="md:hidden space-y-3 p-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="rounded-xl border border-[#E6E1D6] bg-white p-4 dark:border-slate-800 dark:bg-[#151D2A] shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedAssetIds.includes(asset.id)}
                          onChange={() => handleToggleSelectAsset(asset.id)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1E3A5F] focus:ring-[#1E3A5F] cursor-pointer"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#2B4C6F] dark:text-[#FAF7F2]">
                            {asset.name}
                          </h4>
                          <span className="mt-1 inline-block font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-[#FAF7F2] dark:bg-[#111822] px-2 py-0.5 rounded border border-[#E6E1D6] dark:border-slate-800">
                            {asset.asset_code}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${statusStyleMap[asset.status] || statusStyleMap.tersedia}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        <span>{statusLabelMap[asset.status] || asset.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-[#FAF7F2]/70 dark:bg-[#111822]/60 p-3 rounded-xl border border-[#E6E1D6] dark:border-slate-800">
                      <div>
                        <span className="block text-[10px] text-slate-400">Kategori:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{asset.category?.name || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Lokasi:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{asset.location?.name || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Harga Perolehan:</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{formatRupiah(asset.purchase_price)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Nilai Buku:</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{asset.current_book_value !== undefined ? formatRupiah(asset.current_book_value) : '-'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E6E1D6] dark:border-slate-800">
                      <Link
                        to={`/assets/${asset.id}`}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300"
                      >
                        <Eye size={14} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                        Detail
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenSinglePrint(asset)}
                          title="Cetak Stiker Label QR"
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300"
                        >
                          <Printer size={14} className="text-slate-500" />
                          Label
                        </button>
                        {hasPermission('manage-assets') && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(asset)}
                              title="Edit Aset"
                              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300"
                            >
                              <Pencil size={14} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(asset)}
                              title="Hapus Aset"
                              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 shadow-2xs hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                            >
                              <Trash2 size={14} className="text-rose-600 dark:text-rose-400" />
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tampilan Tabel Standar Desktop & Tablet (>= md) */}
              <table className="hidden md:table w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-[#F4F0EA] text-[#2B4C6F] border-b border-[#E6E1D6] text-[11px] font-semibold uppercase tracking-wider dark:bg-[#151D2A] dark:text-[#FAF7F2] dark:border-b dark:border-slate-800">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedAssetIds.length === assets.length && assets.length > 0}
                        onChange={handleSelectAllOnPage}
                        className="rounded border-slate-300 text-[#1E3A5F] focus:ring-[#1E3A5F] cursor-pointer"
                        title="Pilih Semua di Halaman Ini"
                      />
                    </th>
                    <th className="whitespace-nowrap px-4 py-3">Identifikasi Aset</th>
                    <th className="px-4 py-3">Kategori & Penempatan</th>
                    <th className="whitespace-nowrap px-4 py-3">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Biaya Perolehan</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Nilai Buku</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Depresiasi/Thn</th>
                    <th className="whitespace-nowrap px-4 py-3 text-center">QR Verifikasi</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6] dark:divide-slate-800/70">
                  {assets.map((asset) => (
                    <tr 
                      key={asset.id} 
                      className={`transition-colors hover:bg-[#FAF7F2]/80 dark:hover:bg-slate-800/40 ${
                        selectedAssetIds.includes(asset.id) ? 'bg-[#FAF7F2] dark:bg-slate-800/60' : ''
                      }`}
                    >
                      <td className="w-10 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedAssetIds.includes(asset.id)}
                          onChange={() => handleToggleSelectAsset(asset.id)}
                          className="rounded border-slate-300 text-[#1E3A5F] focus:ring-[#1E3A5F] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {asset.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-[#FAF7F2] dark:bg-[#111822] px-1.5 py-0.5 rounded border border-[#E6E1D6] dark:border-slate-800">
                            {asset.asset_code}
                          </span>
                          <Link
                            to={`/assets/${asset.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E3A5F] hover:underline dark:text-[#F4B752] transition-colors"
                          >
                            <Eye size={12} />
                            Detail
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {asset.category?.name || '-'}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <Info size={11} className="text-slate-400" />
                          <span>{asset.location?.name || '-'}</span>
                        </div>
                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded border border-[#E6E1D6] bg-[#FAF7F2] px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                          <span>{typeLabelMap[asset.type || 'single']}</span>
                          <span className="text-slate-400 dark:text-slate-500">•</span>
                          <span className="font-mono font-semibold">
                            {asset.quantity ?? 1} unit
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${statusStyleMap[asset.status] || statusStyleMap.tersedia}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                          <span>{statusLabelMap[asset.status] || asset.status}</span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {formatRupiah(asset.purchase_price)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                        {asset.current_book_value !== undefined ? formatRupiah(asset.current_book_value) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {asset.annual_depreciation !== undefined ? formatRupiah(asset.annual_depreciation) : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {asset.qr_code_url ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="rounded-lg border border-[#E6E1D6] bg-white p-1 dark:border-slate-700 dark:bg-slate-950">
                              <QRCodeSVG value={asset.uuid ? `${window.location.origin}/public/assets/${asset.uuid}` : (asset.qr_code_url || asset.asset_code)} size={34} />
                            </div>
                            <a
                              href={`/public/assets/${asset.uuid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                              <ExternalLink size={9} />
                              <span>Publik</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenSinglePrint(asset)}
                            title="Cetak Stiker Label QR"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E6E1D6] bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Printer size={12} className="text-slate-500" />
                            <span>Label</span>
                          </button>
                          {hasPermission('manage-assets') && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(asset)}
                                title="Edit Aset"
                                className="inline-flex items-center gap-1 rounded-lg border border-[#E6E1D6] bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                <Pencil size={12} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(asset)}
                                title="Hapus Aset"
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 shadow-2xs transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                              >
                                <Trash2 size={12} className="text-rose-600 dark:text-rose-400" />
                                <span>Hapus</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && assets.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E2E0D8] bg-slate-50/50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 sm:flex-row">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      Halaman <span className="font-semibold text-slate-900 dark:text-slate-100">{paginationMeta.current_page}</span> dari <span className="font-semibold text-slate-900 dark:text-slate-100">{paginationMeta.last_page}</span> ({paginationMeta.total} data)
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span>Tampilkan:</span>
                      <select
                        value={filters.per_page || 10}
                        onChange={(e) => handleFilterChange('per_page', Number(e.target.value))}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                      disabled={paginationMeta.current_page === 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800"
                    >
                      <ChevronLeft size={14} />
                      <span>Sebelumnya</span>
                    </button>
                    <button 
                      onClick={() => handlePageChange(paginationMeta.current_page + 1)}
                      disabled={paginationMeta.current_page === paginationMeta.last_page}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800"
                    >
                      <span>Berikutnya</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Modal Tambah Aset */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrasi Aset Inventaris"
        description="Lengkapi parameter data aset, penetapan kategori, alokasi penempatan fisik, dan kalkulasi nilai depresiasi."
        maxWidthClassName="max-w-5xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Kode Aset <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              required
              placeholder="Contoh: AST-2024-001"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nama Aset <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Laptop ThinkPad X1 Carbon"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Tipe Inventaris <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <select
              value={assetType}
              onChange={(e) => {
                const nextType = e.target.value as AssetType;
                setAssetType(nextType);
                setQuantity(nextType === 'single' ? 1 : 0);
                setStatus('tersedia');
              }}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            >
              <option value="single">Aset Tunggal (Single)</option>
              <option value="bulk">Aset Berkelompok (Bulk)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Kuantitas Unit <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              required
              disabled={assetType === 'single'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-850 dark:disabled:text-slate-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">Aset tunggal dikunci otomatis pada 1 unit.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Kategori <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            >
              <option value="">-- Pilih Klasifikasi Kategori --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Lokasi Penempatan <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            >
              <option value="">-- Pilih Lokasi Fasilitas --</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} [{l.code}]
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Tanggal Perolehan <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Biaya Perolehan (IDR) <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Masa Manfaat (Tahun) <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={usefulLifeYears}
              onChange={(e) => setUsefulLifeYears(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nilai Residu (IDR) <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              max={purchasePrice}
              value={residualValue}
              onChange={(e) => setResidualValue(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Status Operasional <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AssetStatus)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            >
              {assetStatusOptions[assetType].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Catatan & Keterangan Tambahan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan nomor seri pabrikan, riwayat perolehan, atau instruksi teknis..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 md:col-span-2 lg:col-span-3 border-t border-[#E6E1D6] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl border border-[#E6E1D6] bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-xs transition-all hover:bg-[#162D4A] active:scale-95 focus:ring-2 focus:ring-[#1E3A5F]/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1E3A5F] dark:hover:bg-[#25456f]"
            >
              {submitLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Simpan Data Aset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Asset Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Data Aset Inventaris"
        description="Perbarui informasi teknis, penempatan, klasifikasi, dan valuasi aset terpilih."
        maxWidthClassName="max-w-3xl"
      >
        <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Kode Aset <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={editAssetCode}
              onChange={(e) => setEditAssetCode(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nama Aset <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Tipe Aset <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <select
              value={editAssetType}
              onChange={(e) => {
                const nextType = e.target.value as AssetType;
                setEditAssetType(nextType);
                if (nextType === 'single') setEditQuantity(1);
                setEditStatus(assetStatusOptions[nextType][0].value);
              }}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            >
              <option value="single">Aset Tunggal (Single)</option>
              <option value="bulk">Aset Berkelompok (Bulk)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Kuantitas <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="number"
              min={editAssetType === 'single' ? 1 : 0}
              disabled={editAssetType === 'single'}
              value={editQuantity}
              onChange={(e) => setEditQuantity(Math.max(0, Number(e.target.value)))}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:disabled:bg-slate-900"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Kategori <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <select
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            >
              <option value="">Pilih Kategori...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Lokasi Fisik <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <select
              value={editLocationId}
              onChange={(e) => setEditLocationId(e.target.value === '' ? '' : Number(e.target.value))}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            >
              <option value="">Pilih Lokasi...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Tanggal Perolehan <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={editPurchaseDate}
              onChange={(e) => setEditPurchaseDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Harga Pembelian (IDR) <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={editPurchasePrice}
              onChange={(e) => setEditPurchasePrice(Number(e.target.value))}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Masa Manfaat (Tahun) <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={editUsefulLifeYears}
              onChange={(e) => setEditUsefulLifeYears(Number(e.target.value))}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nilai Residu (IDR) <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              max={editPurchasePrice}
              value={editResidualValue}
              onChange={(e) => setEditResidualValue(Number(e.target.value))}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Status Operasional <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as AssetStatus)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            >
              {assetStatusOptions[editAssetType].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Catatan & Keterangan
            </label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Catatan kondisi, serial number, atau riwayat..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 md:col-span-2 lg:col-span-3 border-t border-[#E6E1D6] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border border-[#E6E1D6] bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-xs transition-all hover:bg-[#162D4A] active:scale-95 focus:ring-2 focus:ring-[#1E3A5F]/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1E3A5F] dark:hover:bg-[#25456f]"
            >
              {submitLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Cetak Lembar Stiker QR (Lazy Loaded on Demand) */}
      {isBatchPrintOpen && (
        <React.Suspense fallback={null}>
          <BatchQrPrintModal
            isOpen={isBatchPrintOpen}
            onClose={() => {
              setIsBatchPrintOpen(false);
              setSinglePrintAsset(null);
            }}
            selectedAssets={
              singlePrintAsset 
                ? [singlePrintAsset] 
                : (selectedAssetIds.length > 0 
                    ? assets.filter((a) => selectedAssetIds.includes(a.id))
                    : assets)
            }
          />
        </React.Suspense>
      )}

      {/* Dialog Konfirmasi Hapus Aset Modern */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Hapus Aset Inventaris"
        message={`Apakah Anda yakin ingin menghapus data aset "${deletingAsset?.name}" (${deletingAsset?.asset_code})?\nData akan dinonaktifkan dari sistem (Soft Delete).`}
        confirmLabel="Hapus Aset"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeletingAsset(null);
        }}
      />
    </div>
  );
};

export default AssetPage;
