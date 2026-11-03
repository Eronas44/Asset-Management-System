import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Database, History } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { setAuthData, refreshProfile } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authData = await authService.login({ email, password });
      
      let perms = authData.permissions;
      if (authData.roles && authData.permissions) {
        setAuthData(authData);
      } else {
        const profileData = await refreshProfile();
        perms = profileData?.permissions;
      }
      
      if (perms?.includes('view-reports')) {
        navigate('/dashboard');
      } else if (perms?.includes('manage-borrowings')) {
        navigate('/borrowings');
      } else if (perms?.includes('manage-assets')) {
        navigate('/assets');
      } else if (perms?.includes('manage-master-data')) {
        navigate('/categories');
      } else if (perms?.includes('manage-users')) {
        navigate('/users');
      } else {
        navigate('/forbidden');
      }
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      if (apiErr.response?.data?.message) {
        setError(apiErr.response.data.message);
      } else {
        setError('Gagal terhubung ke gateway otentikasi. Periksa koneksi Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white antialiased dark:bg-slate-950">
      {/* Left Column: Corporate Brand & Architectural Identity */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-slate-200 bg-slate-900 p-12 text-white dark:border-slate-800 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-white font-mono text-xs font-bold text-slate-900">
              AM
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
              Asset Management System
            </span>
          </div>

          <div className="mt-20 max-w-md space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-white xl:text-4xl">
              Tata Kelola Inventaris & Aset Fisik Terpadu
            </h1>
            <p className="text-xs leading-relaxed text-slate-400">
              Platform enterprise untuk pengawasan siklus hidup aset, valuasi depresiasi finansial, sirkulasi peminjaman, serta integritas audit forensik.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>RBAC Terkendali</span>
              </div>
              <p className="text-[11px] text-slate-500">Otoritas berlapis granular</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <History size={14} className="text-slate-400" />
                <span>Audit Forensik</span>
              </div>
              <p className="text-[11px] text-slate-500">Pelacakan log real-time</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Database size={14} className="text-slate-400" />
                <span>Data Snapshot</span>
              </div>
              <p className="text-[11px] text-slate-500">Pencadangan terpusat</p>
            </div>
          </div>
          <div className="pt-4 text-[11px] text-slate-600">
            &copy; {new Date().getFullYear()} Corporate Asset Registry. Hak cipta dilindungi.
          </div>
        </div>
      </div>

      {/* Right Column: Portal Authentication Form */}
      <div className="flex w-full items-center justify-center bg-slate-50/50 p-6 dark:bg-slate-950 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile Monogram Header */}
          <div className="lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 font-mono text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-950">
                AM
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Asset Management
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Otentikasi Akun
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Masukkan kredensial resmi Anda untuk mengakses panel kerja.
            </p>
          </div>

          {error && (
            <div className="rounded border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Alamat Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="operator@perusahaan.com"
                  className="w-full rounded border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <LockKeyhole size={14} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full rounded border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-slate-200"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-slate-950/40 dark:border-t-slate-950" />
                    <span>Mengautentikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Konsol</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
            Akses dibatasi hanya untuk personil yang terotorisasi.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
