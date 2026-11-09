import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  History,
  Landmark,
  MapPin,
  QrCode,
  ReceiptText,
  Tag,
  Wallet,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { assetService } from '../../services/asset.service';
import type { Asset } from '../../types/asset';
import type { ActivityLog } from '../../types/activity-log';
import type { AssetBorrowing } from '../../types/asset-borrowing';
import { LoadingIndicator } from '../../components/Feedback/LoadingIndicator';
import { ErrorMessage } from '../../components/Feedback/ErrorMessage';
import { extractErrorMessage } from '../../utils/error';
import { formatRupiah } from '../../utils/format';

const statusStyles: Record<Asset['status'], { label: string; className: string; dot: string }> = {
  available: {
    label: 'Tersedia',
    className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500'
  },
  borrowed: {
    label: 'Dipinjam',
    className: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30',
    dot: 'bg-amber-500'
  },
  maintenance: {
    label: 'Pemeliharaan',
    className: 'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-500/30',
    dot: 'bg-sky-500'
  },
  retired: {
    label: 'Afkir',
    className: 'bg-slate-500/10 text-slate-700 border-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400'
  },
  tersedia: {
    label: 'Tersedia',
    className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500'
  },
  rusak: {
    label: 'Rusak',
    className: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/30',
    dot: 'bg-rose-500'
  },
  'sedang diperbaiki': {
    label: 'Perbaikan',
    className: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30',
    dot: 'bg-amber-500'
  },
  hilang: {
    label: 'Hilang',
    className: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/30',
    dot: 'bg-rose-500'
  },
  dibuang: {
    label: 'Dibuang',
    className: 'bg-slate-500/10 text-slate-700 border-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400'
  },
  habis: {
    label: 'Habis',
    className: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30',
    dot: 'bg-amber-500'
  },
  kadaluarsa: {
    label: 'Kedaluwarsa',
    className: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/30',
    dot: 'bg-rose-500'
  }
};

const typeLabels: Record<NonNullable<Asset['type']>, string> = {
  single: 'Aset Tunggal',
  bulk: 'Aset Berkelompok'
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<{ message: string; traceId?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'specs' | 'depreciation' | 'circulation' | 'audit'>('specs');

  const statusMeta = useMemo(() => {
    if (!asset) return null;
    return statusStyles[asset.status] ?? {
      label: asset.status,
      className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400'
    };
  }, [asset]);

  useEffect(() => {
    if (id) {
      assetService.getById(Number(id))
        .then((response) => {
          setAsset(response.data);
        })
        .catch((err) => {
          const extracted = extractErrorMessage(err);
          setErrorDetails({ message: extracted.message, traceId: extracted.traceId });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const borrowingHistory = (asset?.borrowing_history ?? []) as AssetBorrowing[];
  const activityLogs = (asset?.activity_logs ?? []) as ActivityLog[];
  const publicAssetPath = asset ? `/public/assets/${asset.uuid}` : '';
  const publicAssetUrl = asset ? `${window.location.origin}${publicAssetPath}` : '';

  // Active Custodian / Borrower
  const activeBorrowing = useMemo(() => {
    return borrowingHistory.find((b) => !b.returned_at);
  }, [borrowingHistory]);

  // Lifecycle calculations
  const lifecycleMeta = useMemo(() => {
    if (!asset || !asset.purchase_date || !asset.useful_life_years) {
      return { percentage: 0, ageYears: 0, totalYears: asset?.useful_life_years || 5 };
    }
    const purchaseDate = new Date(asset.purchase_date);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - purchaseDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    const totalYears = asset.useful_life_years;
    const percentage = Math.min(100, Math.max(0, Math.round((diffYears / totalYears) * 100)));
    return {
      percentage,
      ageYears: Number(diffYears.toFixed(1)),
      totalYears
    };
  }, [asset]);

  if (loading) return <LoadingIndicator message="Memuat Digital Passport aset..." />;
  if (errorDetails) return <ErrorMessage message={errorDetails.message} traceId={errorDetails.traceId} />;
  if (!asset) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E2E0D8] bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900/70">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Data aset tidak ditemukan.</p>
        <Link
          to="/assets"
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-blue-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
        >
          <ArrowLeft size={16} />
          Kembali ke Inventaris
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E0D8] pb-5 dark:border-white/10">
        <div>
          <Link
            to="/assets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline mb-2 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Inventaris</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {asset.name}
            </h1>
            <span className="rounded-md border border-[#E2E0D8] bg-white/70 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-300">
              {asset.asset_code}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Asset Digital Passport & Verifikasi Valuasi Finansial Terpusat.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {statusMeta && (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusMeta.className}`}>
              <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
          )}
        </div>
      </div>

      {/* Asset Digital Passport Split-View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Sticky Visual Identity Card (Passport) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[#E2E0D8] bg-white dark:border-white/10 dark:bg-slate-900/80 shadow-md backdrop-blur-xl">
            
            {/* Passport Hologram Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-4 text-white">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-sky-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-sky-300">
                    Asset Digital Passport
                  </span>
                </div>
                <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/80">
                  ID: #{asset.id}
                </span>
              </div>
              <div className="pointer-events-none absolute -right-4 -bottom-6 h-24 w-24 rounded-full bg-sky-500/20 blur-xl" />
            </div>

            {/* Passport QR Core */}
            <div className="p-6 flex flex-col items-center text-center">
              <div className="relative p-3 rounded-2xl border border-[#E2E0D8] bg-white shadow-inner dark:border-white/10 dark:bg-slate-950">
                {/* HUD corner brackets */}
                <span className="pointer-events-none absolute top-1 left-1 h-3 w-3 border-t-2 border-l-2 border-blue-600 dark:border-sky-400" />
                <span className="pointer-events-none absolute top-1 right-1 h-3 w-3 border-t-2 border-r-2 border-blue-600 dark:border-sky-400" />
                <span className="pointer-events-none absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-blue-600 dark:border-sky-400" />
                <span className="pointer-events-none absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-blue-600 dark:border-sky-400" />

                {publicAssetUrl ? (
                  <QRCodeSVG value={publicAssetUrl} size={150} />
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center text-slate-300 dark:text-slate-600">
                    <QrCode size={48} />
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-1">
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">{asset.asset_code}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{asset.name}</p>
              </div>

              {publicAssetPath && (
                <a
                  href={publicAssetPath}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-100 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-400"
                >
                  <ExternalLink size={13} className="text-blue-600 dark:text-sky-400" />
                  <span>Buka Portal Verifikasi Publik</span>
                </a>
              )}
            </div>

            {/* Lifecycle Progress Bar */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  Siklus Masa Manfaat
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {lifecycleMeta.percentage}% ({lifecycleMeta.ageYears} / {lifecycleMeta.totalYears} Thn)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    lifecycleMeta.percentage > 85 
                      ? 'bg-rose-500' 
                      : lifecycleMeta.percentage > 60 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${lifecycleMeta.percentage}%` }}
                />
              </div>
            </div>

            {/* Custodian & Verification Details */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <User size={13} className="text-blue-600 dark:text-sky-400" /> Penanggung Jawab
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {activeBorrowing ? activeBorrowing.borrower_name : (asset.location?.name ? `Lokasi: ${asset.location.name}` : 'Penyimpanan Master')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Landmark size={13} className="text-slate-400" /> Kategori
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {asset.category?.name || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Clock3 size={13} className="text-slate-400" /> Terakhir Update
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatDate(asset.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bento Tabs */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Segmented Tab Controls */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E2E0D8] bg-white p-1.5 dark:border-white/10 dark:bg-slate-900/70 shadow-xs backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'specs'
                  ? 'bg-blue-600 text-white shadow-sm dark:bg-sky-400 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <Tag size={14} />
              <span>Spesifikasi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('depreciation')}
              className={`flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'depreciation'
                  ? 'bg-blue-600 text-white shadow-sm dark:bg-sky-400 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <Wallet size={14} />
              <span>Valuasi Fiskal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('circulation')}
              className={`flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'circulation'
                  ? 'bg-blue-600 text-white shadow-sm dark:bg-sky-400 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <History size={14} />
              <span>Sirkulasi ({borrowingHistory.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-sm dark:bg-sky-400 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <ReceiptText size={14} />
              <span>Log Audit ({activityLogs.length})</span>
            </button>
          </div>

          {/* Tab 1: Spesifikasi & Identitas */}
          {activeTab === 'specs' && (
            <div className="rounded-2xl border border-[#E2E0D8] bg-white p-6 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Tag size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Identitas Teknis & Alokasi</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Parameter fisik, lokasi penempatan, dan catatan perolehan</p>
                  </div>
                </div>
              </div>

              <dl className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Kode Registrasi Resmi</dt>
                  <dd className="font-mono font-bold text-slate-900 dark:text-white">{asset.asset_code}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Nama Aset Inventaris</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{asset.name}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Klasifikasi Tipe</dt>
                  <dd className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    <span>{typeLabels[asset.type || 'single']}</span>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-700 dark:bg-sky-950 dark:text-sky-300">
                      {asset.quantity ?? 1} Unit
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                    <Landmark size={14} className="text-slate-400" /> Kategori Klasifikasi
                  </dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{asset.category?.name || '-'}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                    <MapPin size={14} className="text-slate-400" /> Lokasi Fasilitas
                  </dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{asset.location?.name || '-'}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Tanggal Perolehan Aset</dt>
                  <dd className="font-mono text-slate-900 dark:text-white">{formatDate(asset.purchase_date)}</dd>
                </div>
                <div className="flex items-start justify-between py-3">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Catatan Kondisi & Serial</dt>
                  <dd className="max-w-[65%] text-right text-slate-700 dark:text-slate-300 leading-relaxed font-mono">{asset.notes || 'Tidak ada catatan spesifik.'}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Tab 2: Valuasi Fiskal & Depresiasi */}
          {activeTab === 'depreciation' && (
            <div className="space-y-4">
              {/* Financial Hero Vault Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                    <ShieldCheck size={14} /> Straight-Line Book Value
                  </span>
                  <span className="font-mono text-xs text-emerald-400/80">Audit Ready</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Total Nilai Buku Fiskal Saat Ini</p>
                  <p className="mt-2 font-mono text-3xl font-extrabold tracking-tight text-white">
                    {formatRupiah(asset.current_book_value)}
                  </p>
                </div>
              </div>

              {/* Sub-grid of Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#E2E0D8] bg-white p-4 dark:border-white/10 dark:bg-slate-900/70 shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Harga Perolehan Awal</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(asset.purchase_price)}</p>
                </div>
                <div className="rounded-2xl border border-[#E2E0D8] bg-white p-4 dark:border-white/10 dark:bg-slate-900/70 shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Estimasi Nilai Residu</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(asset.residual_value)}</p>
                </div>
                <div className="rounded-2xl border border-[#E2E0D8] bg-white p-4 dark:border-white/10 dark:bg-slate-900/70 shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Masa Manfaat Aset</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{asset.useful_life_years} Tahun</p>
                </div>
                <div className="rounded-2xl border border-[#E2E0D8] bg-white p-4 dark:border-white/10 dark:bg-slate-900/70 shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Beban Depresiasi / Tahun</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(asset.annual_depreciation)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Sirkulasi Peminjaman */}
          {activeTab === 'circulation' && (
            <div className="rounded-2xl border border-[#E2E0D8] bg-white p-5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Riwayat Sirkulasi Penggunaan
                </h3>
                <span className="font-mono text-xs text-slate-500">{borrowingHistory.length} Transaksi</span>
              </div>

              {borrowingHistory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Belum ada catatan sirkulasi peminjaman untuk aset ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {borrowingHistory.map((item) => {
                    const isReturned = Boolean(item.returned_at);
                    return (
                      <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-850/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{item.borrower_name}</span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            isReturned
                              ? 'border-emerald-500/20 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'border-amber-500/20 bg-amber-50/80 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isReturned ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {isReturned ? 'Selesai Dikembalikan' : 'Sedang Dipinjam'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                          <div>
                            <span className="block text-[10px] text-slate-400">Waktu Pinjam:</span>
                            <span>{formatDate(item.borrowed_at)}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Waktu Kembali:</span>
                            <span>{item.returned_at ? formatDate(item.returned_at) : 'Belum Dikembalikan'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Log Audit Forensik */}
          {activeTab === 'audit' && (
            <div className="rounded-2xl border border-[#E2E0D8] bg-white p-5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Jejak Audit Forensik Aset
                </h3>
                <span className="font-mono text-xs text-slate-500">{activityLogs.length} Entri</span>
              </div>

              {activityLogs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Belum ada catatan aktivitas forensik untuk unit ini.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="relative space-y-1">
                      <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900 dark:bg-sky-400" />
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-white">{log.operator}</span>
                        <span className="font-mono text-[10px] text-slate-400">{formatDate(log.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{log.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AssetDetailPage;
