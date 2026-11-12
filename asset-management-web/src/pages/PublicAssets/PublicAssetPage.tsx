import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicAssetService } from '../../services/public-asset.service';
import type { PublicAssetData } from '../../services/public-asset.service';
import {
  Building2,
  CheckCircle2,
  Clock,
  Landmark,
  Layers,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  LogIn
} from 'lucide-react';

const PublicAssetPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [asset, setAsset] = useState<PublicAssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uuid) {
      publicAssetService.getByUuid(uuid)
        .then((data) => {
          setAsset(data);
        })
        .catch((err) => {
          console.error(err);
          setError('Data aset tidak ditemukan atau tautan verifikasi tidak sah.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [uuid]);

  const getStatusBadge = (status: string) => {
    if (status === 'available' || status === 'tersedia') {
      return {
        label: 'Tersedia',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
        dot: 'bg-emerald-500'
      };
    }
    if (status === 'borrowed') {
      return {
        label: 'Sedang Dipinjam',
        className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300',
        dot: 'bg-amber-500'
      };
    }
    if (status === 'maintenance' || status === 'sedang diperbaiki') {
      return {
        label: 'Pemeliharaan',
        className: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300',
        dot: 'bg-sky-500'
      };
    }
    return {
      label: status,
      className: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
      dot: 'bg-slate-400'
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Memuat verifikasi data aset...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
            <ShieldAlert size={20} />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Verifikasi Gagal</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{error}</p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950"
            >
              <LogIn size={13} />
              Buka Portal Petugas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusMeta = asset ? getStatusBadge(asset.status) : null;

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-12 text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Institutional Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 font-mono text-[11px] font-bold text-white dark:bg-slate-100 dark:text-slate-950">
              AM
            </div>
            <div>
              <span className="block text-xs font-semibold tracking-tight text-slate-900 dark:text-white">
                ASSET MANAGEMENT SYSTEM
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Lembar Verifikasi Publik Resmi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-mono">UUID: {uuid ? uuid.slice(0, 8) + '...' : '-'}</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              <LogIn size={11} />
              Portal Petugas
            </Link>
          </div>
        </header>

        {asset && (
          <main className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* Title & Status Strip */}
            <div className="border-b border-slate-100 p-6 dark:border-slate-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
                    KODE: {asset.asset_code}
                  </span>
                  <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {asset.name}
                  </h1>
                </div>
                {statusMeta && (
                  <span className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                )}
              </div>
            </div>

            {/* Core Verification Data Grid */}
            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                  <Layers size={14} className="text-slate-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Spesifikasi Inventaris
                  </span>
                </div>

                <dl className="space-y-3 text-xs">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Kode Aset</dt>
                    <dd className="font-mono font-medium text-slate-900 dark:text-white">{asset.asset_code}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Nama Aset</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">{asset.name}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Status Operasional</dt>
                    <dd className="font-medium capitalize text-slate-900 dark:text-white">{asset.status}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                  <Building2 size={14} className="text-slate-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Penempatan & Kategori
                  </span>
                </div>

                <dl className="space-y-3 text-xs">
                  <div className="flex items-baseline justify-between">
                    <dt className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Landmark size={12} className="text-slate-400" /> Kategori
                    </dt>
                    <dd className="font-medium text-slate-900 dark:text-white">{asset.category || '-'}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <MapPin size={12} className="text-slate-400" /> Lokasi Fisik
                    </dt>
                    <dd className="font-medium text-slate-900 dark:text-white">{asset.location || '-'}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock size={12} className="text-slate-400" /> Waktu Akses
                    </dt>
                    <dd className="font-mono text-slate-600 dark:text-slate-400">
                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date())}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Verification Notice */}
            <div className="border-t border-slate-100 bg-slate-50/70 p-4 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p>
                  Informasi ini dikeluarkan secara otomatis oleh sistem pencatatan inventaris terpusat. Kode QR dan UUID pada fisik aset telah tervalidasi.
                </p>
              </div>
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          <p>Sistem Manajemen Aset Korporat &copy; {new Date().getFullYear()} &bull; Verifikasi Digital</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicAssetPage;
