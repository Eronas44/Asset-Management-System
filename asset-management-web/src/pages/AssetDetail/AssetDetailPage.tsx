import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  History,
  Landmark,
  MapPin,
  Package,
  QrCode,
  ReceiptText,
  Tag,
  Wallet
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
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    dot: 'bg-emerald-500'
  },
  borrowed: {
    label: 'Dipinjam',
    className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    dot: 'bg-amber-500'
  },
  maintenance: {
    label: 'Pemeliharaan',
    className: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    dot: 'bg-sky-500'
  },
  retired: {
    label: 'Afkir',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400'
  },
  tersedia: {
    label: 'Tersedia',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    dot: 'bg-emerald-500'
  },
  rusak: {
    label: 'Rusak',
    className: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    dot: 'bg-rose-500'
  },
  'sedang diperbaiki': {
    label: 'Perbaikan',
    className: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    dot: 'bg-sky-500'
  },
  hilang: {
    label: 'Hilang',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400'
  },
  dibuang: {
    label: 'Dibuang',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400'
  },
  habis: {
    label: 'Habis',
    className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    dot: 'bg-amber-500'
  },
  kadaluarsa: {
    label: 'Kedaluwarsa',
    className: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
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

  if (loading) return <LoadingIndicator message="Memuat detail aset..." />;
  if (errorDetails) return <ErrorMessage message={errorDetails.message} traceId={errorDetails.traceId} />;
  if (!asset) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Data aset tidak ditemukan.</p>
        <Link
          to="/assets"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          <ArrowLeft size={14} />
          Kembali ke Inventaris
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              to="/assets"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft size={13} />
              Kembali ke Inventaris
            </Link>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {asset.name}
              </h1>
              <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                / {asset.asset_code}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Spesifikasi detail, valuasi buku terkini, kepemilikan, dan log audit aset.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusMeta && (
              <span className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Package size={12} className="text-slate-400" />
              {asset.asset_code}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* General Information Card */}
          <section className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Tag size={14} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Informasi Umum</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Identitas fisik dan klasifikasi penempatan</p>
                </div>
              </div>
            </div>

            <dl className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Kode Registrasi</dt>
                <dd className="font-mono font-medium text-slate-900 dark:text-white">{asset.asset_code}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Nama Aset</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{asset.name}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Klasifikasi Tipe</dt>
                <dd className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <span>{typeLabels[asset.type || 'single']}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Qty {asset.quantity ?? 1}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Landmark size={13} className="text-slate-400" /> Kategori
                </dt>
                <dd className="font-medium text-slate-900 dark:text-white">{asset.category?.name || '-'}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <MapPin size={13} className="text-slate-400" /> Lokasi Penempatan
                </dt>
                <dd className="font-medium text-slate-900 dark:text-white">{asset.location?.name || '-'}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Tanggal Perolehan</dt>
                <dd className="font-mono text-slate-900 dark:text-white">{formatDate(asset.purchase_date)}</dd>
              </div>
              <div className="flex items-start justify-between py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Catatan Kondisi</dt>
                <dd className="max-w-[65%] text-right text-slate-700 dark:text-slate-300">{asset.notes || '-'}</dd>
              </div>
            </dl>
          </section>

          {/* Financial & Depreciation Card */}
          <section className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Wallet size={14} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Finansial & Depresiasi</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Valuasi buku garis lurus dan nilai penyusutan</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Harga Perolehan</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{formatRupiah(asset.purchase_price)}</p>
              </div>
              <div className="rounded border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nilai Residu</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{formatRupiah(asset.residual_value)}</p>
              </div>
              <div className="rounded border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Masa Manfaat</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{asset.useful_life_years} Tahun</p>
              </div>
              <div className="rounded border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Depresiasi / Tahun</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{formatRupiah(asset.annual_depreciation)}</p>
              </div>
            </div>

            <div className="mt-4 rounded border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Nilai Buku Saat Ini</p>
                  <p className="mt-1 font-mono text-xl font-bold tabular-nums text-emerald-900 dark:text-emerald-200">{formatRupiah(asset.current_book_value)}</p>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  Straight-Line
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar: QR Verification & Timestamps */}
        <section className="space-y-6">
          <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <QrCode size={14} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Verifikasi QR Code</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pindai fisik untuk audit lapangan</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 rounded border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-800/30">
              {publicAssetUrl ? (
                <div className="rounded border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-700 dark:bg-slate-950">
                  <QRCodeSVG value={publicAssetUrl} size={150} />
                </div>
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded border border-slate-200 bg-white text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600">
                  <QrCode size={48} />
                </div>
              )}
              <div className="space-y-1">
                <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white">{asset.asset_code}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{asset.name}</p>
                {publicAssetPath && (
                  <div className="pt-2">
                    <a
                      href={publicAssetPath}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Buka Tautan Publik <ExternalLink size={11} className="text-slate-400" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> Terakhir Diperbarui</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{formatDate(asset.updated_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5"><ReceiptText size={13} /> Tanggal Registrasi</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{formatDate(asset.created_at)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Borrowing History */}
      <section className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <History size={14} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Riwayat Peminjaman</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Catatan sirkulasi penggunaan unit aset</p>
            </div>
          </div>
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {borrowingHistory.length} Sirkulasi
          </span>
        </div>

        {borrowingHistory.length === 0 ? (
          <div className="rounded border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Tidak ada riwayat peminjaman untuk unit aset ini.
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Peminjam</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Waktu Pinjam</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Target Pengembalian</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Waktu Kembali</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/80 dark:bg-slate-900">
                {borrowingHistory.map((history) => {
                  const isReturned = Boolean(history.returned_at);
                  return (
                    <tr key={history.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900 dark:text-white">{history.borrower_name}</span>
                        {history.borrowed_by_user_name && (
                          <span className="block text-[11px] text-slate-400">Oleh: {history.borrowed_by_user_name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{formatDate(history.borrowed_at)}</td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{formatDate(history.expected_return_at)}</td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{formatDate(history.returned_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium ${
                          isReturned
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isReturned ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {isReturned ? 'Dikembalikan' : 'Dipinjam'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Activity Logs */}
      <section className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <ReceiptText size={14} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Jejak Aktivitas Terkait</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Rekam jejak forensik audit perubahan aset</p>
            </div>
          </div>
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {activityLogs.length} Entri
          </span>
        </div>

        {activityLogs.length === 0 ? (
          <div className="rounded border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Belum ada rekaman audit trail untuk aset ini.
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Waktu</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Operator</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Tindakan</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/80 dark:bg-slate-900">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{formatDate(log.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{log.operator}</td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AssetDetailPage;
