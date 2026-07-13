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

const statusStyles: Record<Asset['status'], { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/20' },
  borrowed: { label: 'Borrowed', className: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/20' },
  maintenance: { label: 'Maintenance', className: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/20' },
  retired: { label: 'Retired', className: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600' },
  tersedia: { label: 'Tersedia', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/20' },
  rusak: { label: 'Rusak', className: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-100 dark:ring-rose-500/20' },
  'sedang diperbaiki': { label: 'Sedang Diperbaiki', className: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/20' },
  hilang: { label: 'Hilang', className: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600' },
  dibuang: { label: 'Dibuang', className: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600' },
  habis: { label: 'Habis', className: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/20' },
  kadaluarsa: { label: 'Kadaluarsa', className: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-100 dark:ring-rose-500/20' }
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
    return statusStyles[asset.status];
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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Data aset tidak ditemukan.</p>
        <Link to="/assets" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
          <ArrowLeft size={16} />
          Kembali ke inventaris
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link to="/assets" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            <ArrowLeft size={16} />
            Kembali ke inventaris
          </Link>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Detail aset</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{asset.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              Ringkasan spesifikasi, status, nilai buku, dan jejak penggunaan aset.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {statusMeta && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusMeta.className}`}>
              {statusMeta.label}
            </span>
          )}
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Package size={14} />
            {asset.asset_code}
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-2 text-white dark:bg-slate-100 dark:text-slate-900">
                <Tag size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Informasi umum</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Identitas dan kondisi dasar aset.</p>
              </div>
            </div>

            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-3 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Kode aset</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{asset.asset_code}</dd>
              </div>
              <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-3 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Nama aset</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{asset.name}</dd>
              </div>
              <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-3 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Tipe aset</dt>
                <dd className="text-right font-medium text-slate-900 dark:text-white">
                  {typeLabels[asset.type || 'single']}
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Qty {asset.quantity ?? 1}
                  </span>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-3 dark:border-slate-800">
                <dt className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400"><Landmark size={14} /> Kategori</dt>
                <dd className="text-right font-medium text-slate-900 dark:text-white">{asset.category?.name || '-'}</dd>
              </div>
              <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-3 dark:border-slate-800">
                <dt className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400"><MapPin size={14} /> Lokasi</dt>
                <dd className="text-right font-medium text-slate-900 dark:text-white">{asset.location?.name || '-'}</dd>
              </div>
              <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-3 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Tanggal perolehan</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{formatDate(asset.purchase_date)}</dd>
              </div>
              <div className="flex items-start justify-between gap-6">
                <dt className="text-slate-500 dark:text-slate-400">Catatan</dt>
                <dd className="max-w-[60%] text-right font-medium text-slate-900 dark:text-white">{asset.notes || '-'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-2 text-white dark:bg-emerald-500 dark:text-slate-950">
                <Wallet size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Finansial & depresiasi</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Nilai pembelian dan estimasi penyusutan.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Harga pembelian</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(asset.purchase_price)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Nilai residu</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(asset.residual_value)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Umur manfaat</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{asset.useful_life_years} tahun</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Depresiasi / tahun</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(asset.annual_depreciation)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-100">Nilai buku saat ini</p>
              <p className="mt-2 text-2xl font-bold text-emerald-800 dark:text-emerald-50">{formatRupiah(asset.current_book_value)}</p>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-600 p-2 text-white dark:bg-indigo-500 dark:text-slate-950">
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">QR & identitas cepat</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pindai atau salin kode aset untuk verifikasi.</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/70">
            {publicAssetUrl ? (
              <div className="rounded-2xl border border-white bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <QRCodeSVG value={publicAssetUrl} size={160} />
              </div>
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
                <QrCode size={80} />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{asset.asset_code}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{asset.name}</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">QR menuju halaman public aset</p>
              {publicAssetPath && (
                <a href={publicAssetPath} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
                  <ExternalLink size={10} /> Link
                </a>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
              <Clock3 size={16} className="text-slate-400 dark:text-slate-500" />
              <span>Diperbarui: {formatDate(asset.updated_at)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
              <ReceiptText size={16} className="text-slate-400 dark:text-slate-500" />
              <span>Dibuat: {formatDate(asset.created_at)}</span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-amber-500 p-2 text-white dark:bg-amber-400 dark:text-slate-950">
            <History size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Riwayat peminjaman</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Catatan sirkulasi penggunaan aset.</p>
          </div>
        </div>

        {borrowingHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400">
            Aset ini belum pernah dipinjam.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Peminjam</th>
                  <th className="px-4 py-3 font-medium">Dipinjam</th>
                  <th className="px-4 py-3 font-medium">Estimasi kembali</th>
                  <th className="px-4 py-3 font-medium">Dikembalikan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {borrowingHistory.map((history) => {
                  const isReturned = Boolean(history.returned_at);
                  return (
                    <tr key={history.id} className="align-top">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                              <div>{history.borrower_name}</div>
                              {history.borrowed_by_user_name && (
                                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                  User: {history.borrowed_by_user_name}
                                </div>
                              )}
                            </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(history.borrowed_at)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(history.expected_return_at)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(history.returned_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isReturned ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-100'}`}>
                          {isReturned ? 'Selesai' : 'Sedang dipinjam'}
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

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-sky-600 p-2 text-white dark:bg-sky-500 dark:text-slate-950">
            <ReceiptText size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Jejak aktivitas</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Audit trail yang terkait dengan aset ini.</p>
          </div>
        </div>

        {activityLogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400">
            Belum ada rekaman aktivitas terkait.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">Operator</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                  <th className="px-4 py-3 font-medium">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="align-top">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(log.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{log.operator}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
