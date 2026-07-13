import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { publicAssetService } from '../../services/public-assest.service';
import type { PublicAssetData } from '../../services/public-assest.service';
import { BadgeInfo, Building2, CheckCircle2, Hash, Layers3, MapPinned, ShieldAlert, Sparkles } from 'lucide-react';

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
          setError('Data aset tidak ditemukan atau tautan tidak valid.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [uuid]);

  const getStatusStyle = (status: string) => {
    if (status === 'available') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'borrowed') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-indigo-400" />
          <p className="text-sm text-slate-300">Memuat informasi aset...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/20">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Akses Data Tidak Tersedia</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(15,23,42,0.88))] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-200">
                <Sparkles size={14} /> Public Asset View
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Informasi Inventaris Aset</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Halaman publik untuk memeriksa identitas aset, kategori, lokasi, dan status operasional melalui tautan unik.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <BadgeInfo size={16} className="text-indigo-300" />
              <span>Tautan diverifikasi via UUID</span>
            </div>
          </div>
        </div>

        {asset && (
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-200">
                    <Hash size={14} /> {asset.asset_code}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{asset.name}</h2>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${getStatusStyle(asset.status)}`}>
                  <CheckCircle2 size={14} />
                  {asset.status}
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                <div className="mb-4 flex items-center gap-2 font-semibold text-slate-200">
                  <Layers3 size={18} className="text-indigo-300" />
                  Informasi Aset
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                    <span className="text-slate-400">Kode Aset</span>
                    <strong className="text-white">{asset.asset_code}</strong>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                    <span className="text-slate-400">Nama Item</span>
                    <strong className="text-white">{asset.name}</strong>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                    <span className="text-slate-400">Kategori</span>
                    <span className="text-white">{asset.category}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                    <span className="text-slate-400">Lokasi Posisi</span>
                    <span className="text-white">{asset.location}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-400">Status Terkini</span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusStyle(asset.status)}`}>
                      {asset.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                <div className="mb-4 flex items-center gap-2 font-semibold text-slate-200">
                  <Building2 size={18} className="text-emerald-300" />
                  Konteks Aset
                </div>
                <div className="grid gap-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <MapPinned size={16} className="text-indigo-300" />
                      Lokasi
                    </div>
                    <p className="mt-2">{asset.location}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <BadgeInfo size={16} className="text-emerald-300" />
                      Kategori
                    </div>
                    <p className="mt-2">{asset.category}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <ShieldAlert size={16} className="text-amber-300" />
                      Catatan Akses
                    </div>
                    <p className="mt-2">Status publik ini hanya menampilkan data dasar aset untuk verifikasi cepat melalui tautan unik.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAssetPage;
