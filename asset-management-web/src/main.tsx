import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/Feedback/ToastContext'
import './index.css'

// Tangani pembaruan rute/chunk Vite secara otomatis saat rilis bundle baru
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

window.addEventListener('error', (event) => {
  if (
    event?.message?.includes('Failed to fetch dynamically imported module') ||
    event?.message?.includes('Loading chunk')
  ) {
    event.preventDefault();
    const lastReload = sessionStorage.getItem('chunk_reload_ts');
    const now = Date.now();
    // Hindari loop jika error terjadi terus-menerus dalam interval 10 detik
    if (!lastReload || now - Number(lastReload) > 10000) {
      sessionStorage.setItem('chunk_reload_ts', String(now));
      window.location.reload();
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
