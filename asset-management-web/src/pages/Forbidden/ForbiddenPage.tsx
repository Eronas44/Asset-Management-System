import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, ShieldAlert } from 'lucide-react';

const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_100%)]" />
      <div className="relative max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/20">
          <ShieldAlert size={30} />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <LockKeyhole size={14} /> Restricted Access
        </div>
        <h1 className="mt-5 text-5xl font-bold tracking-tight text-white">403</h1>
        <h3 className="mt-3 text-xl font-semibold text-slate-100">Akses Ditolak</h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-300">
          Anda tidak memiliki permission yang diperlukan untuk membuka halaman ini.
        </p>
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-400"
          >
            <ArrowLeft size={18} />
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
