import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Terdeteksi uncaught runtime error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FAF7F2] text-slate-800 dark:bg-[#111822] dark:text-[#FAF7F2] font-sans antialiased">
          <div className="w-full max-w-lg rounded-2xl border border-[#E6E1D6] bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-[#1A2433] text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400 shadow-2xs">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <span className="rounded-full bg-[#F4B752] px-2.5 py-0.5 text-[10px] font-bold text-slate-900 uppercase tracking-wide">
                Pemulihan Sistem
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#2B4C6F] dark:text-[#FAF7F2]">
                Terjadi Kendala Teknis Pada Antarmuka
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                Aplikasi mendeteksi interupsi saat memuat komponen halaman ini. Sesi data Anda tetap aman di server.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/80 p-3 text-left font-mono text-[11px] text-slate-600 dark:border-slate-800 dark:bg-[#111822] dark:text-slate-300 overflow-x-auto max-h-28">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2 text-xs font-semibold text-[#FAF7F2] shadow-sm hover:bg-[#162D4A] cursor-pointer transition-colors"
              >
                <RefreshCw size={14} />
                <span>Muat Ulang Halaman</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-[#E6E1D6] bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <Home size={14} />
                <span>Kembali ke Pusat Kendali</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
