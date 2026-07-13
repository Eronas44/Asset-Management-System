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
  ExternalLink, Eye, Info
} from 'lucide-react';

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
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100',
  borrowed: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100',
  maintenance: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-100',
  retired: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100',
  tersedia: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100',
  rusak: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100',
  'sedang diperbaiki': 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-100',
  hilang: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  dibuang: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  habis: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100',
  kadaluarsa: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100'
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

  // Di bawahnya adalah state yang sudah ada sebelumnya, seperti:
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [locations, setLocations] = useState<AssetLocation[]>([]);
  
  // State Terpadu untuk Filter dan Paginasi Sesuai Petunjuk Arsitektur
  const [filters, setFilters] = useState<AssetFilterParams>({
    search: '',
    status: '',
    asset_category_id: '',
    asset_location_id: '',
    page: 1,
    per_page: 5 // Diatur 5 item per halaman untuk kemudahan demo paginasi
  });

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
  const [usefulLifeYears, setUsefulLifeYears] = useState<number>(5); // Default 5 tahun
  const [residualValue, setResidualValue] = useState<number>(0);
  const [status, setStatus] = useState<AssetStatus>('tersedia');
  const [notes, setNotes] = useState('');
  const [exportLoading, setExportLoading] = useState<{ csv: boolean; pdf: boolean }>({ csv: false, pdf: false });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Ambil data Dropdown (hanya dijalankan sekali saat komponen dimuat)
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

  // Ambil data tabel aset (dijalankan berulang setiap kali state filter / halaman berubah)
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

  // Handler Perubahan Filter (Otomatis Reset ke Halaman 1)
  const handleFilterChange = (field: keyof AssetFilterParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1 // Reset halaman ke halaman pertama saat kriteria filter berubah
    }));
  };

  // Handler Pindah Halaman Paginasi (Pertahankan Filter Aktif)
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage
    }));
  };

    // Fungsi utilitas untuk memproses unduhan biner Blob di browser
  const triggerDownload = (blobData: Blob, fileExtension: 'csv' | 'pdf') => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a');
    link.href = url;
    
    // Menamai file sesuai standar: assets-report-YYYY-MM-DD
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `assets-report-${dateStr}.${fileExtension}`);
    
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const handleExportCsv = async () => {
    setExportLoading((prev) => ({ ...prev, csv: true }));
    try {
      // Kirim objek parameter filter yang saat ini sedang aktif di tabel
      const data = await assetService.exportCsv(filters);
      triggerDownload(data, 'csv');
    } catch (err) {
      console.error('Gagal mengekspor CSV:', err);
      alert('Gagal mengunduh laporan CSV.');
    } finally {
      setExportLoading((prev) => ({ ...prev, csv: false }));
    }
  };

  const handleExportPdf = async () => {
    setExportLoading((prev) => ({ ...prev, pdf: true }));
    try {
      // Kirim objek parameter filter yang saat ini sedang aktif di tabel
      const data = await assetService.exportPdf(filters);
      triggerDownload(data, 'pdf');
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
      alert('Gagal mengunduh laporan PDF.');
    } finally {
      setExportLoading((prev) => ({ ...prev, pdf: false }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!categoryId || !locationId) {
      setMessage({ text: 'Kategori dan Lokasi wajib dipilih.', isError: true });
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
      if (err.response && err.response.data && err.response.data.message) {
        setMessage({ text: err.response.data.message, isError: true });
      } else {
        setMessage({ text: 'Gagal menambahkan aset baru.', isError: true });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Manajemen Inventaris Aset</h2>
          <p className="mt-1 text-gray-500 dark:text-slate-400">Kelola dan pantau seluruh aset inventaris perusahaan beserta nilai ekonomisnya.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={18} /> Tambah Aset
        </button>
      </div>

      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${
          message.isError ? 'border-red-100 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100' : 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100'
        }`}>
          <div className="mt-0.5">
            {message.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <p>{message.text}</p>
        </div>
      )}

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah Aset Inventaris Baru"
        description="Form lebar untuk input aset baru, lengkap dengan kategori, lokasi, dan nilai depresiasi."
        maxWidthClassName="max-w-6xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Kode Aset <span className="text-red-500">*</span></label>
            <input type="text" value={assetCode} onChange={(e) => setAssetCode(e.target.value)} required placeholder="Misal: AST-2023-001" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-mono text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Nama Aset <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Misal: Laptop MacBook Pro" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Tipe Aset <span className="text-red-500">*</span></label>
            <select
              value={assetType}
              onChange={(e) => {
                const nextType = e.target.value as AssetType;
                setAssetType(nextType);
                setQuantity(nextType === 'single' ? 1 : 0);
                setStatus('tersedia');
              }}
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="single">Aset Tunggal</option>
              <option value="bulk">Aset Berkelompok</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Jumlah <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              required
              disabled={assetType === 'single'}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Aset tunggal otomatis bernilai 1.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Kategori Aset <span className="text-red-500">*</span></label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Lokasi Penempatan <span className="text-red-500">*</span></label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">-- Pilih Lokasi --</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Tanggal Pembelian <span className="text-red-500">*</span></label>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Harga Pembelian (IDR) <span className="text-red-500">*</span></label>
            <input type="number" min="0" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} onFocus={(e) => e.target.select()} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Umur Manfaat (Tahun) <span className="text-red-500">*</span></label>
            <input type="number" min="1" value={usefulLifeYears} onChange={(e) => setUsefulLifeYears(Number(e.target.value))} onFocus={(e) => e.target.select()} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Nilai Residu / Sisa (IDR) <span className="text-red-500">*</span></label>
            <input type="number" min="0" max={purchasePrice} value={residualValue} onChange={(e) => setResidualValue(Number(e.target.value))} onFocus={(e) => e.target.select()} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Status Operasional <span className="text-red-500">*</span></label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AssetStatus)} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              {assetStatusOptions[assetType].map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Catatan / Keterangan</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Informasi tambahan mengenai aset..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <button type="submit" disabled={submitLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto">
              {submitLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Simpan Aset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Komponen Antarmuka Penyelarasan Filter (Query Parameter Bind) */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row">
        <div className="mr-2 flex shrink-0 items-center gap-2 font-semibold text-gray-700 dark:text-slate-200">
          <Filter size={18} />
          <span>Filter Data:</span>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Cari nama / kode..." 
              value={filters.search} 
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="">Semua Status</option>
            {assetFilterStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select value={filters.asset_category_id} onChange={(e) => handleFilterChange('asset_category_id', e.target.value ? Number(e.target.value) : '')} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="">Semua Kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.asset_location_id} onChange={(e) => handleFilterChange('asset_location_id', e.target.value ? Number(e.target.value) : '')} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="">Semua Lokasi</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Tabel Inventaris Aset */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">Daftar Inventaris & Nilai Ekonomis</h4>
            <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
              {paginationMeta.total} Total
            </div>
          </div>
          
          {/* Tombol Export hanya muncul jika pengguna memiliki izin view-reports */}
          {hasPermission('view-reports') && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExportCsv} 
                disabled={exportLoading.csv}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20"
              >
                {exportLoading.csv ? (
                  <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
                ) : (
                  <FileSpreadsheet size={16} />
                )}
                CSV
              </button>
              <button 
                onClick={handleExportPdf} 
                disabled={exportLoading.pdf}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/20"
              >
                {exportLoading.pdf ? (
                  <div className="w-4 h-4 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin"></div>
                ) : (
                  <FileText size={16} />
                )}
                PDF
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-slate-400">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
              <p>Memuat data aset inventaris...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-slate-800 dark:text-slate-500">
                <Package size={32} />
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white">Tidak Ada Data</h3>
              <p className="max-w-md text-sm text-gray-500 dark:text-slate-400">Aset tidak ditemukan berdasarkan kriteria filter yang Anda berikan, atau belum ada aset yang didaftarkan.</p>
            </div>
          ) : (
            <>
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
              <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Aset</th>
                  <th className="px-6 py-4">Kategori & Lokasi</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right">Harga Pembelian</th>
                  <th className="px-6 py-4 text-right">Nilai Buku Saat Ini</th>
                  <th className="px-6 py-4 text-right">Depresiasi / Thn</th>
                  <th className="px-6 py-4 text-center">QR Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {assets.map((asset) => (
                  <tr key={asset.id} className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-slate-800/70">
                    <td className="px-6 py-4">
                      <div className="text-base font-semibold text-gray-800 dark:text-white">{asset.name}</div>
                      <div className="mb-2 mt-1 inline-block rounded border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">{asset.asset_code}</div>
                      <div>
                        <Link
                          to={`/assets/${asset.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          <Eye size={12} />
                          Lihat Detail
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-1 font-medium text-gray-800 dark:text-white">{asset.category?.name || '-'}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <Info size={12} /> {asset.location?.name || '-'}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {typeLabelMap[asset.type || 'single']}
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                          Total {asset.quantity ?? 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${statusStyleMap[asset.status] || statusStyleMap.tersedia}`}>
                        {statusLabelMap[asset.status] || asset.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-gray-700 dark:text-slate-300">
                      {formatRupiah(asset.purchase_price)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-gray-700 dark:text-slate-300">
                      {asset.current_book_value !== undefined ? formatRupiah(asset.current_book_value) : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-gray-700 dark:text-slate-300">
                      {asset.annual_depreciation !== undefined ? formatRupiah(asset.annual_depreciation) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {asset.qr_code_url ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <QRCodeSVG value={asset.qr_code_url} size={40} />
                          </div>
                          <a href={`/public/assets/${asset.uuid}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
                            <ExternalLink size={10} /> Link
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && assets.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
                <span className="text-sm text-gray-600 dark:text-slate-300">
                  Menampilkan halaman <span className="font-semibold text-gray-800 dark:text-white">{paginationMeta.current_page}</span> dari <span className="font-semibold text-gray-800 dark:text-white">{paginationMeta.last_page}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                    disabled={paginationMeta.current_page === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft size={16} />
                    Sebelumnya
                  </button>
                  <button 
                    onClick={() => handlePageChange(paginationMeta.current_page + 1)}
                    disabled={paginationMeta.current_page === paginationMeta.last_page}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Berikutnya
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>

      </div>

    </div>
  );
};

export default AssetPage;
