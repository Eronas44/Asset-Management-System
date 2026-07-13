import { Component } from 'react';
import  type{  ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <h2>⚠️ Terjadi Kesalahan Sistem Kritis</h2>
          <p style={{ color: '#6c757d' }}>Aplikasi gagal merender elemen halaman ini. Silakan muat ulang halaman browser Anda.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            🔄 Segarkan Halaman
          </button>
        </div>
      );
    }

    return this.props.children; // Hapus tanda dolar ($) dan ganti -> menjadi titik (.)
  }
}
