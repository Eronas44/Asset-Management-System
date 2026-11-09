import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, X, AlertCircle, CheckCircle2, 
  ExternalLink, ArrowRight, RefreshCw, UploadCloud, Monitor,
  ScanLine
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../../services/asset.service';
import type { Asset } from '../../types/asset';
import { QuickBorrowModal } from '../Borrowing/QuickBorrowModal';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerId = 'qr-reader-container';

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [detectedAsset, setDetectedAsset] = useState<Asset | null>(null);
  const [isSearchingAsset, setIsSearchingAsset] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [borrowSuccessMessage, setBorrowSuccessMessage] = useState<string | null>(null);

  const stopScanner = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {
        // Abaikan jika scanner sudah tidak dalam status aktif atau sudah dibersihkan
      } finally {
        isStartingRef.current = false;
        setIsScanning(false);
      }
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    // Mencegah eksekusi ganda jika beberapa frame kamera mendeteksi QR sekaligus
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setScannedResult(decodedText);
    await stopScanner();

    // Ekstrak kode atau uuid dari decoded text
    let lookupQuery = decodedText.trim();
    // 1. Cek jika format decodedText mengandung pola UUID standar
    const uuidMatch = decodedText.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) {
      lookupQuery = uuidMatch[0];
    } else {
      // 2. Cek jika format URL: .../public/assets/{identifikasi}
      const publicUrlMatch = decodedText.match(/public\/assets\/([a-zA-Z0-9-_]+)/);
      if (publicUrlMatch) {
        lookupQuery = publicUrlMatch[1];
      }
    }

    // Cari aset di database
    setIsSearchingAsset(true);
    setSearchError(null);
    try {
      const response = await assetService.getAll({ search: lookupQuery, per_page: 10 });
      const assetsList = response.data || [];
      if (assetsList.length > 0) {
        // Cari aset yang benar-benar cocok dengan kode atau uuid
        const exactMatch = assetsList.find(
          a => (a.uuid && a.uuid.toLowerCase() === lookupQuery.toLowerCase()) ||
               (a.asset_code && a.asset_code.toLowerCase() === lookupQuery.toLowerCase()) ||
               (a.name && a.name.toLowerCase().includes(lookupQuery.toLowerCase()))
        );
        setDetectedAsset(exactMatch || assetsList[0]);
      } else {
        setSearchError(`Aset dengan kode atau identifikasi "${lookupQuery}" tidak ditemukan di database.`);
      }
    } catch (err) {
      console.error(err);
      setSearchError('Gagal memverifikasi identitas aset ke server.');
    } finally {
      setIsSearchingAsset(false);
    }
  };

  const startScanner = async () => {
    if (isStartingRef.current || isScanning) return;
    isStartingRef.current = true;

    setCameraError(null);
    setScannedResult(null);
    setDetectedAsset(null);
    setSearchError(null);
    setBorrowSuccessMessage(null);
    isProcessingRef.current = false;

    await stopScanner();

    timerRef.current = setTimeout(async () => {
      try {
        const containerElem = document.getElementById(containerId);
        if (!containerElem) {
          isStartingRef.current = false;
          return;
        }

        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        const config = {
          fps: 15,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText: string) => {
            handleScanSuccess(decodedText);
          },
          undefined
        );

        isStartingRef.current = false;
        setIsScanning(true);
      } catch (err: unknown) {
        isStartingRef.current = false;
        if (!document.getElementById(containerId)) return;
        console.error('Kamera gagal diakses:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        setCameraError(
          errMsg.includes('NotAllowedError') || errMsg.includes('Permission')
            ? 'Izin akses kamera ditolak oleh browser. Silakan aktifkan izin kamera atau gunakan unggah foto barcode.'
            : 'Tidak dapat mendeteksi atau mengakses perangkat kamera pada sistem ini.'
        );
        setIsScanning(false);
      }
    }, 150);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await stopScanner();
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }
      const decodedText = await scannerRef.current.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      console.error(err);
      setSearchError('Tidak ditemukan barcode atau QR code yang valid pada gambar yang diunggah.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      stopScanner();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#090D16]/75 backdrop-blur-md"
        onClick={() => {
          stopScanner();
          onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E2E0D8] bg-white/95 backdrop-blur-2xl shadow-2xl dark:border-white/10 dark:bg-slate-900/95 animate-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#E2E0D8] px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 dark:bg-sky-950/40 dark:border-sky-500/30 dark:text-sky-400 shadow-2xs">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
                <span>Pindai QR / Barcode Aset</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-[#34D399]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  HUD ACTIVE
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Arahkan kamera ke stiker label QR aset fisik atau unggah gambar
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer rounded-xl text-slate-400 hover:bg-[#F4F3EF] hover:text-[#0F172A] dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Hasil Pindaian Berhasil */}
          {scannedResult && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/60 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-[#10B981] dark:text-[#34D399] shrink-0" />
                <div className="space-y-1 w-full text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-900 dark:text-[#34D399]">
                      QR Berhasil Terdeteksi
                    </p>
                    <button
                      onClick={startScanner}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-300 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Scan Ulang
                    </button>
                  </div>
                  <p className="font-mono text-xs text-emerald-800 dark:text-emerald-200 break-all bg-white/80 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40">
                    {scannedResult}
                  </p>
                </div>
              </div>

              {/* Status Pencarian Aset di Backend */}
              {isSearchingAsset && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <RefreshCw size={14} className="animate-spin text-blue-500" />
                  Mencari rincian aset di inventaris...
                </div>
              )}

              {/* Rincian Aset Ditemukan */}
              {detectedAsset && (
                <div className="mt-4 rounded-2xl border border-[#E2E0D8] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  {borrowSuccessMessage && (
                    <div className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 animate-in fade-in duration-200">
                      <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-semibold">Peminjaman Berhasil:</span> {borrowSuccessMessage}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400">
                        {detectedAsset.asset_code}
                      </span>
                      <h4 className="text-xs font-bold text-[#0F172A] dark:text-white mt-1.5">
                        {detectedAsset.name}
                      </h4>
                    </div>
                    <span className="rounded-full border border-[#E2E0D8] bg-[#F4F3EF] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                      {detectedAsset.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 my-2 pt-2 border-t border-[#E2E0D8] dark:border-white/10">
                    <div>
                      <span className="block text-[10px] text-slate-400">Kategori:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{detectedAsset.category?.name || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Lokasi:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{detectedAsset.location?.name || '-'}</span>
                    </div>
                  </div>

                  {/* Tombol Tindakan Cepat */}
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-[#E2E0D8] dark:border-white/10">
                    <button
                      onClick={() => {
                        stopScanner();
                        onClose();
                        navigate(`/assets?search=${encodeURIComponent(detectedAsset.asset_code)}`);
                      }}
                      className="min-h-[38px] flex cursor-pointer items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 transition-all"
                    >
                      <Monitor size={14} />
                      Lihat di Inventaris
                      <ArrowRight size={14} />
                    </button>

                    {(detectedAsset.status === 'tersedia' || detectedAsset.status === 'available') && (
                      <button
                        onClick={() => setIsBorrowModalOpen(true)}
                        className="min-h-[38px] flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                      >
                        Pinjamkan Aset
                      </button>
                    )}

                    {detectedAsset.status === 'borrowed' && (
                      <button
                        onClick={() => {
                          stopScanner();
                          onClose();
                          navigate('/borrowings');
                        }}
                        className="min-h-[38px] flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300 transition-colors"
                      >
                        Buku Sirkulasi
                        <ArrowRight size={14} />
                      </button>
                    )}

                    {detectedAsset.uuid && (
                      <a
                        href={`/public/assets/${detectedAsset.uuid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[38px] flex items-center gap-1 rounded-xl border border-[#E2E0D8] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#F4F3EF] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                      >
                        <ExternalLink size={14} />
                        Publik
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Error jika aset tidak ditemukan */}
              {searchError && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}
            </div>
          )}

          {/* Area Kamera Pemindai dengan FUTURISTIC HUD VIEWFINDER OVERLAY */}
          {!scannedResult && (
            <div className="relative rounded-2xl overflow-hidden border border-[#E2E0D8] bg-slate-950 dark:border-white/10 shadow-inner">
              <div id={containerId} className="w-full min-h-[300px] flex items-center justify-center" />
              
              {/* Futuristic HUD Viewfinder Overlay */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  
                  {/* Top HUD Telemetry Ticker */}
                  <div className="absolute top-3 inset-x-0 flex justify-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-sky-500/40 backdrop-blur-md text-[10px] font-mono text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                      <ScanLine size={12} className="animate-pulse text-sky-400" />
                      <span>HUD VIEWFINDER // ALIGN TARGET QR</span>
                    </div>
                  </div>

                  {/* Viewfinder Target Frame with Glowing Cyan/Emerald Brackets & Laser */}
                  <div className="relative h-56 w-56 rounded-2xl border border-sky-400/30 shadow-[0_0_0_9999px_rgba(9,13,22,0.65)] overflow-hidden">
                    
                    {/* Glowing Cyan/Emerald Corner Brackets */}
                    <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-sky-400 rounded-tl-lg shadow-[0_0_10px_#38BDF8]" />
                    <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg shadow-[0_0_10px_#34D399]" />
                    <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg shadow-[0_0_10px_#34D399]" />
                    <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-sky-400 rounded-br-lg shadow-[0_0_10px_#38BDF8]" />

                    {/* Subtle Crosshairs Marker */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-4 w-4 relative">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-sky-400/40" />
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-sky-400/40" />
                      </div>
                    </div>

                    {/* Animated Laser Scan Line */}
                    <div className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38BDF8] animate-laser" />
                  </div>

                  {/* Bottom Telemetry Guide */}
                  <div className="absolute bottom-3 inset-x-0 flex justify-center">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2.5 py-0.5 rounded-full border border-white/10">
                      Auto-detect active
                    </span>
                  </div>
                </div>
              )}

              {/* Jika Kamera Error */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-100">
                  <AlertCircle size={32} className="text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-slate-200 mb-1">
                    Akses Kamera Tidak Tersedia
                  </p>
                  <p className="text-[11px] text-slate-400 mb-4 max-w-xs">
                    {cameraError}
                  </p>
                  <button
                    onClick={startScanner}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    <RefreshCw size={13} />
                    Coba Akses Lagi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Opsi Fallback: Unggah Gambar QR */}
          <div className="pt-2 border-t border-[#E2E0D8] dark:border-white/10">
            <label className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-dashed border-[#E2E0D8] hover:border-blue-500 bg-[#F4F3EF]/60 hover:bg-[#F4F3EF] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors">
              <UploadCloud size={16} className="text-blue-600 dark:text-sky-400" />
              <span>Pindai dari File Gambar Barcode / Foto Galeri</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end border-t border-[#E2E0D8] px-5 py-3.5 bg-[#F4F3EF]/60 dark:border-white/10 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="min-h-[38px] cursor-pointer rounded-xl border border-[#E2E0D8] bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* Modal Formulir Peminjaman Aset Langsung */}
      <QuickBorrowModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        asset={detectedAsset}
        onSuccess={(borrowerName: string) => {
          if (detectedAsset) {
            setDetectedAsset({
              ...detectedAsset,
              status: 'borrowed'
            });
          }
          setBorrowSuccessMessage(`Unit aset berhasil dipinjamkan kepada ${borrowerName}!`);
        }}
      />
    </div>
  );
};
