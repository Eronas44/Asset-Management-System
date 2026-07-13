import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { refreshProfile } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login({ email, password });
      // Jika berhasil, arahkan ke dashboard
      await refreshProfile(); 
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      // Tangani error respon dari Laravel API
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal terhubung ke server. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#111827_45%,_#0b1220_100%)]" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          <div className="relative hidden flex-col justify-between gap-10 p-10 lg:flex">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(99,102,241,0.16),_transparent_40%)]" />
            <div className="relative z-10">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white">
                  <Building2 size={16} />
                </div>
                <span className="font-medium tracking-wide">AssetSystem</span>
              </div>

              <h1 className="max-w-lg text-4xl font-bold tracking-tight text-white xl:text-5xl">
                Kelola inventaris, peminjaman, dan keamanan data dalam satu panel.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Akses dashboard untuk memantau aset, transaksi, aktivitas pengguna, serta backup & restore database dengan alur kerja yang terpusat.
              </p>
            </div>

            <div className="relative z-10 grid gap-4 text-sm text-slate-200 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 inline-flex items-center gap-2 text-emerald-300">
                  <ShieldCheck size={16} /> Hak akses terkontrol
                </div>
                <p className="text-slate-300">Login hanya untuk pengguna yang memiliki kredensial dan permission yang sesuai.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 inline-flex items-center gap-2 text-indigo-300">
                  <Sparkles size={16} /> Tampilan konsisten
                </div>
                <p className="text-slate-300">Masuk ke dashboard dengan antarmuka yang seragam dan lebih mudah dipindai.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
            <form
              onSubmit={handleLogin}
              className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl sm:p-8"
            >
              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
                  <LockKeyhole size={22} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Masuk ke Sistem</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Gunakan akun terdaftar untuk mengakses modul inventaris dan administrasi.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-200">Email</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="nama@perusahaan.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-200">Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <LockKeyhole size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Masukkan password"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
