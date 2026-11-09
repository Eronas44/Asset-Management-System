import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Download, 
  ExternalLink, 
  Loader2, 
  Layers, 
  CheckCircle2, 
  Scissors,
  FileDown,
  Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import type { Asset } from '../../types/asset';

interface BatchQrPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
}

export const BatchQrPrintModal: React.FC<BatchQrPrintModalProps> = ({
  isOpen,
  onClose,
  selectedAssets
}) => {
  // Pengaturan Stiker
  const [companyName, setCompanyName] = useState('PT. EROAS ASSET MANAGEMENT');
  const [includeCompanyHeader, setIncludeCompanyHeader] = useState(true);
  const [includeDate, setIncludeDate] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [layoutColumns, setLayoutColumns] = useState<'2' | '3'>('2');

  // Status Pemrosesan Web PDF
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [activeSheetTab, setActiveSheetTab] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const printSheetsContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || selectedAssets.length === 0) return null;

  // Paginasi: 2 Kolom (10 stiker per A4), 3 Kolom (18 stiker per A4)
  const itemsPerPage = layoutColumns === '2' ? 10 : 18;
  const totalPages = Math.ceil(selectedAssets.length / itemsPerPage);

  // Potong aset per halaman lembar A4
  const paginatedSheets: Asset[][] = [];
  for (let i = 0; i < totalPages; i++) {
    paginatedSheets.push(selectedAssets.slice(i * itemsPerPage, (i + 1) * itemsPerPage));
  }

  // Generate PDF langsung dari Web via Pure Vector Engine (Cepat, Presisi, Tanpa Bergantung pada Chrome Print)
  const handleGeneratePdf = async (action: 'download' | 'preview' | 'print') => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setProcessingStatus('Menyusun stiker dokumen PDF standar A4...');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const is2Col = layoutColumns === '2';
      const marginX = is2Col ? 10 : 8;
      const marginTop = is2Col ? 12 : 10;
      const gapX = is2Col ? 6 : 4;
      const gapY = is2Col ? 5 : 4;
      const cols = is2Col ? 2 : 3;
      const cardW = is2Col ? 92 : 62;
      const cardH = is2Col ? 50 : 41;

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        setProcessingStatus(`Menyusun lembar A4 ke-${pageIdx + 1} dari ${totalPages}...`);

        if (pageIdx > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const pageAssets = paginatedSheets[pageIdx] || [];

        for (let itemIdx = 0; itemIdx < pageAssets.length; itemIdx++) {
          const asset = pageAssets[itemIdx];
          const col = itemIdx % cols;
          const row = Math.floor(itemIdx / cols);

          const cardX = marginX + col * (cardW + gapX);
          const cardY = marginTop + row * (cardH + gapY);

          // 1. Kartu Latar & Border Potong
          pdf.setFillColor(255, 255, 255);
          if (showCutGuides) {
            pdf.setDrawColor(203, 213, 225); // slate-300
            pdf.setLineDashPattern([1.5, 1.5], 0);
          } else {
            pdf.setDrawColor(226, 232, 240); // slate-200
            pdf.setLineDashPattern([], 0);
          }
          pdf.roundedRect(cardX, cardY, cardW, cardH, 1.5, 1.5, 'FD');
          pdf.setLineDashPattern([], 0);

          // 2. Header Organisasi
          if (includeCompanyHeader) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(cardX + 0.5, cardY + 0.5, cardW - 1, 6, 'F');

            pdf.setDrawColor(226, 232, 240);
            pdf.line(cardX, cardY + 6.5, cardX + cardW, cardY + 6.5);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(is2Col ? 7.5 : 6.5);
            pdf.setTextColor(30, 41, 59);
            const maxCompLen = is2Col ? 50 : 32;
            const displayComp = companyName.length > maxCompLen
              ? companyName.slice(0, maxCompLen) + '...'
              : companyName;
            pdf.text(displayComp.toUpperCase(), cardX + 3, cardY + 4.8);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(5);
            pdf.setTextColor(100, 116, 139);
            pdf.text('OFFICIAL', cardX + cardW - 3, cardY + 4.8, { align: 'right' });
          }

          // 3. QR Code (Diambil dari Canvas Offscreen Beresolusi Tinggi)
          const headerH = includeCompanyHeader ? 7.5 : 2;
          const qrSize = is2Col ? 24 : 18;
          const qrX = cardX + 2.5;
          const qrY = cardY + headerH + 1;

          const qrCanvas = (document.getElementById(`qr-canvas-source-${asset.id}`) ||
                            document.getElementById(`qr-canvas-${asset.id}`)) as HTMLCanvasElement | null;
          if (qrCanvas) {
            try {
              const qrDataUrl = qrCanvas.toDataURL('image/png');
              pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
            } catch (err) {
              console.warn('Gagal membaca data QR:', err);
            }
          }

          // Teks SCAN ME
          pdf.setFont('courier', 'normal');
          pdf.setFontSize(4.5);
          pdf.setTextColor(148, 163, 184);
          pdf.text('SCAN ME', qrX + qrSize / 2, qrY + qrSize + 2.5, { align: 'center' });

          // 4. Informasi Aset
          const infoX = qrX + qrSize + 3;
          const infoW = cardX + cardW - infoX - 2.5;
          let textY = qrY + 3;

          // Badge Kode Aset
          pdf.setFillColor(241, 245, 249);
          pdf.roundedRect(infoX, textY - 3, infoW, 5, 0.8, 0.8, 'F');
          pdf.setFont('courier', 'bold');
          pdf.setFontSize(is2Col ? 8 : 7);
          pdf.setTextColor(15, 23, 42);
          pdf.text(asset.asset_code, infoX + 2, textY + 0.8);
          textY += 6;

          // Nama Aset
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(is2Col ? 7.5 : 6.5);
          pdf.setTextColor(15, 23, 42);
          const nameLines = pdf.splitTextToSize(asset.name, infoW);
          const maxLines = is2Col ? 2 : 1;
          const displayLines = nameLines.slice(0, maxLines);
          pdf.text(displayLines, infoX, textY);
          textY += (displayLines.length * 3.5) + 1;

          // Kategori
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(is2Col ? 6.5 : 5.5);
          pdf.setTextColor(71, 85, 105);
          const catStr = `Kat: ${asset.category?.name || '-'}`;
          pdf.text(catStr.length > 25 ? catStr.slice(0, 25) + '...' : catStr, infoX, textY);
          textY += 3;

          // Lokasi
          if (includeLocation) {
            const locStr = `Lok: ${asset.location?.name || '-'}`;
            pdf.text(locStr.length > 25 ? locStr.slice(0, 25) + '...' : locStr, infoX, textY);
            textY += 3;
          }

          // Tanggal Perolehan
          if (includeDate && asset.purchase_date) {
            pdf.text(`Tgl: ${asset.purchase_date.slice(0, 10)}`, infoX, textY);
            textY += 3;
          }

          // 5. Footer Stiker
          pdf.setDrawColor(241, 245, 249);
          pdf.line(cardX + 2, cardY + cardH - 4.5, cardX + cardW - 2, cardY + cardH - 4.5);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(is2Col ? 5 : 4.5);
          pdf.setTextColor(148, 163, 184);
          pdf.text('PROPERTI PERUSAHAAN • DILARANG MELEPAS STIKER', cardX + cardW / 2, cardY + cardH - 1.8, { align: 'center' });
        }

        // Footer Lembar A4
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`LEMBAR ${pageIdx + 1} DARI ${totalPages} • STANDAR A4 (210 x 297 mm)`, 105, 292, { align: 'center' });
      }

      setProcessingStatus('Menyelesaikan berkas...');
      const fileName = `Stiker-QR-Aset-A4-${new Date().toISOString().slice(0, 10)}.pdf`;

      if (action === 'download') {
        pdf.save(fileName);
        setSuccessMessage(`Berhasil mengunduh dokumen "${fileName}". Siap dicetak langsung.`);
      } else if (action === 'preview') {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setSuccessMessage('Dokumen PDF berhasil dibuka di tab baru.');
      } else if (action === 'print') {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const printIframe = document.createElement('iframe');
        printIframe.style.position = 'fixed';
        printIframe.style.right = '0';
        printIframe.style.bottom = '0';
        printIframe.style.width = '0';
        printIframe.style.height = '0';
        printIframe.style.border = '0';
        printIframe.src = blobUrl;
        document.body.appendChild(printIframe);
        printIframe.onload = () => {
          setTimeout(() => {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
            setTimeout(() => {
              if (document.body.contains(printIframe)) {
                document.body.removeChild(printIframe);
              }
              URL.revokeObjectURL(blobUrl);
            }, 5000);
          }, 300);
        };
        setSuccessMessage('Perintah cetak dikirim ke printer.');
      }
    } catch (error) {
      console.error('Gagal memproses PDF stiker:', error);
      alert('Terjadi kesalahan saat memproses stiker QR langsung dari web.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
      
      {/* Hidden Offscreen QR Canvases untuk Menjamin Sumber QR Selalu Tersedia */}
      <div 
        aria-hidden="true"
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: '-9999px', 
          opacity: 0,
          pointerEvents: 'none' 
        }}
      >
        {selectedAssets.map((asset) => {
          const qrVal = asset.uuid 
            ? `${window.location.origin}/public/assets/${asset.uuid}`
            : asset.asset_code;
          return (
            <QRCodeCanvas
              key={`src-${asset.id}`}
              id={`qr-canvas-source-${asset.id}`}
              value={qrVal}
              size={256}
              level="H"
              includeMargin={false}
            />
          );
        })}
      </div>

      {/* Container Utama Modal */}
      <div className="relative flex w-full max-w-6xl max-h-[96vh] flex-col overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1A2433] print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none">
        
        {/* Header Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E1D6] px-6 py-3.5 bg-[#FAF7F2]/60 dark:border-slate-800 dark:bg-[#111822]/40 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1E3A5F] border border-[#E6E1D6] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 shadow-2xs">
              <FileDown size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#2B4C6F] dark:text-[#FAF7F2]">
                  Cetak & Unduh Label QR Aset Fisik
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={10} /> Diproses Langsung dari Web
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedAssets.length} aset terpilih &bull; {totalPages} lembar format stiker A4 presisi (anti-potong)
              </p>
            </div>
          </div>

          {/* Tombol Aksi Cepat di Header */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleGeneratePdf('preview')}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-[#FAF7F2] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              title="Buka tampilan PDF di tab baru"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Preview PDF</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleGeneratePdf('download')}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2 text-xs font-semibold text-[#FAF7F2] shadow-sm hover:bg-[#162D4A] active:scale-98 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses Web PDF...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Unduh PDF Siap Cetak (A4)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifikasi Status & Info */}
        {successMessage && (
          <div className="flex items-center justify-between bg-emerald-50 px-6 py-2 text-xs text-emerald-800 border-b border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
            >
              &times;
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-3 bg-blue-50 px-6 py-2 text-xs text-blue-900 border-b border-blue-100 dark:bg-sky-950/40 dark:border-sky-900 dark:text-sky-200 print:hidden">
            <Loader2 size={14} className="animate-spin text-blue-600 dark:text-sky-400" />
            <span className="font-medium">{processingStatus}</span>
          </div>
        )}

        {/* Toolbar Pengaturan Stiker */}
        <div className="border-b border-[#E6E1D6] bg-[#FAF7F2]/40 p-4 dark:border-slate-800 dark:bg-slate-900/50 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Input Nama Organisasi */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Organisasi / Perusahaan
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="PT. EROAS ASSET MANAGEMENT"
                className="w-full rounded-xl border border-[#E6E1D6] bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Pilihan Layout Kolom */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Format Lembar Kertas A4
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLayoutColumns('2');
                    setActiveSheetTab(0);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    layoutColumns === '2'
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-[#E6E1D6] bg-white text-slate-700 hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  2 Kolom (10/Hal)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLayoutColumns('3');
                    setActiveSheetTab(0);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    layoutColumns === '3'
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-[#E6E1D6] bg-white text-slate-700 hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  3 Kolom (18/Hal)
                </button>
              </div>
            </div>

            {/* Checkbox Opsi Informasi */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-2 pt-2 sm:pt-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includeCompanyHeader}
                  onChange={(e) => setIncludeCompanyHeader(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs">Header Organisasi</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includeLocation}
                  onChange={(e) => setIncludeLocation(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs">Lokasi Aset</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includeDate}
                  onChange={(e) => setIncludeDate(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs">Tgl Perolehan</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={showCutGuides}
                  onChange={(e) => setShowCutGuides(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs flex items-center gap-1">
                  <Scissors size={12} className="text-slate-400" />
                  Garis Potong
                </span>
              </label>
            </div>
          </div>

          {/* Indikator Alokasi Halaman Otomatis (Bila Lebih dari 1 Lembar) */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#1E3A5F] dark:text-[#F4B752] flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#E6E1D6] dark:border-slate-700 shadow-2xs">
                  <Layers size={13} />
                  Otomatis {totalPages} Lembar Kertas A4
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                  (Seluruh lembar ditampilkan bertingkat di bawah & otomatis masuk ke dokumen PDF)
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="text-[10px] text-slate-400 font-medium mr-1">Lompat ke:</span>
                {paginatedSheets.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const targetEl = document.getElementById(`sheet-wrapper-${idx}`);
                      targetEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setActiveSheetTab(idx);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                      activeSheetTab === idx
                        ? 'bg-[#1E3A5F] text-[#FAF7F2] border-[#1E3A5F] dark:bg-[#F4B752] dark:text-slate-900'
                        : 'bg-white text-slate-700 border-[#E6E1D6] hover:bg-[#FAF7F2] hover:border-[#1E3A5F] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                    }`}
                  >
                    Kertas #{idx + 1} ({paginatedSheets[idx].length})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sheet Preview & Printable Area (Wysiwyg A4 View) */}
        <div 
          ref={printSheetsContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/60 dark:bg-slate-950/80 flex flex-col items-center gap-8 print:p-0 print:bg-white print:overflow-visible"
        >
          {paginatedSheets.map((pageAssets, pageIdx) => {
            return (
              <div key={pageIdx} id={`sheet-wrapper-${pageIdx}`} className="flex flex-col items-center gap-2 w-full max-w-[794px]">
                {/* Header Penanda Kertas A4 (Muncul jika lebih dari 1 kertas) */}
                <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-xs print:hidden">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-[#1E3A5F] dark:text-[#F4B752]">
                      KERTAS A4 LEMBAR KE-{pageIdx + 1} DARI {totalPages}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal text-[11px]">
                      {pageAssets.length} Stiker ({layoutColumns === '2' ? 'Format 2 Kolom' : 'Format 3 Kolom'})
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Stiker #{pageIdx * itemsPerPage + 1} - #{pageIdx * itemsPerPage + pageAssets.length}
                  </span>
                </div>

                {/* Kontainer Lembar Kertas Fisik A4 */}
                <div
                  id={`printable-a4-sheet-${pageIdx}`}
                  className="w-[794px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 p-8 shadow-xl rounded-md border border-slate-300 relative flex flex-col justify-between box-border mb-4 print:mb-0 print:shadow-none print:border-none print:p-6 print:w-full print:max-h-none print:block print:page-break-after-always"
                  style={{
                    width: '794px',
                    minHeight: '1123px',
                    boxSizing: 'border-box',
                  }}
                >
                {/* Header Lembar A4 */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs tracking-wider text-slate-800 uppercase">
                      {companyName}
                    </span>
                    <span className="text-[10px] text-slate-400">&bull;</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      LEMBAR LABEL QR ASET RESMI
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Lembar {pageIdx + 1} dari {totalPages} &bull; {pageAssets.length} Stiker
                  </div>
                </div>

                {/* Grid Stiker Label A4 */}
                <div
                  className={`grid flex-1 content-start gap-3.5 ${
                    layoutColumns === '2' ? 'grid-cols-2' : 'grid-cols-3'
                  }`}
                >
                  {pageAssets.map((asset) => {
                    const qrValue = asset.uuid 
                      ? `${window.location.origin}/public/assets/${asset.uuid}`
                      : asset.asset_code;

                    return (
                      <div
                        key={asset.id}
                        className={`relative flex flex-col justify-between bg-white p-3 text-slate-900 rounded-sm break-inside-avoid ${
                          showCutGuides
                            ? 'border border-dashed border-slate-300'
                            : 'border border-solid border-slate-200 shadow-2xs'
                        }`}
                        style={{
                          pageBreakInside: 'avoid',
                          minHeight: layoutColumns === '2' ? '175px' : '150px',
                        }}
                      >
                        {/* Cut corner guides */}
                        {showCutGuides && (
                          <div className="absolute -top-1.5 -left-1.5 text-slate-300 pointer-events-none">
                            <Scissors size={10} />
                          </div>
                        )}

                        {/* Top Bar Label */}
                        {includeCompanyHeader && (
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                            <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider text-slate-800 uppercase truncate max-w-[190px]">
                              <ShieldCheck size={11} className="text-slate-700 shrink-0" />
                              <span className="truncate">{companyName}</span>
                            </div>
                            <span className="text-[8px] font-mono font-semibold text-slate-500 bg-slate-100 px-1 py-0.2 rounded uppercase shrink-0">
                              OFFICIAL
                            </span>
                          </div>
                        )}

                        {/* Body Label: QR & Metadata */}
                        <div className="flex items-center gap-2.5 flex-1">
                          {/* QR Code Canvas */}
                          <div className="flex flex-col items-center justify-center p-1 bg-white border border-slate-200 rounded shrink-0 shadow-2xs">
                            <QRCodeCanvas
                              id={`qr-canvas-${asset.id}`}
                              value={qrValue}
                              size={layoutColumns === '2' ? 76 : 64}
                              level="H"
                              includeMargin={false}
                            />
                            <span className="text-[6.5px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">
                              SCAN ME
                            </span>
                          </div>

                          {/* Metadata Aset */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="font-mono text-[11px] font-bold text-slate-950 tracking-tight block truncate bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {asset.asset_code}
                            </div>
                            <h4 className="text-[11px] font-semibold text-slate-900 line-clamp-2 leading-snug">
                              {asset.name}
                            </h4>

                            <div className="space-y-0.5 text-[8.5px] text-slate-600 pt-0.5">
                              <div className="truncate">
                                <span className="text-slate-400">Kat:</span> {asset.category?.name || '-'}
                              </div>
                              {includeLocation && (
                                <div className="truncate">
                                  <span className="text-slate-400">Lok:</span> {asset.location?.name || '-'}
                                </div>
                              )}
                              {includeDate && asset.purchase_date && (
                                <div className="truncate">
                                  <span className="text-slate-400">Tgl:</span> {asset.purchase_date.slice(0, 10)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Security Footer */}
                        <div className="mt-2 pt-1 border-t border-slate-100 text-[7px] text-slate-400 text-center font-mono uppercase tracking-tight">
                          PROPERTI PERUSAHAAN &bull; DILARANG MELEPAS STIKER INI
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Lembar A4 */}
                <div className="pt-3 mt-4 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                  <span>SISTEM MANAJEMEN ASET TERPADU</span>
                  <span>STANDAR UKURAN KERTAS A4 (210 &times; 297 mm)</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Footer Modal & Tombol Aksi */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 px-6 py-3.5 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info size={14} className="text-slate-400 shrink-0" />
            <span>
              Format otomatis disesuaikan ke ukuran kertas stiker label A4. Unduh berkas PDF untuk hasil cetak paling presisi.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Tutup
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleGeneratePdf('print')}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Kirim ke printer tanpa dialog browser yang berantakan"
            >
              <Printer size={14} />
              <span>Cetak ke Printer</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleGeneratePdf('download')}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-98 transition-all disabled:opacity-50 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses Dokumen...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Unduh PDF Siap Cetak (A4)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* CSS Cetak Terisolasi (@media print) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          [id^="printable-a4-sheet"], [id^="printable-a4-sheet"] * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          [id^="printable-a4-sheet"] {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            min-height: auto !important;
            max-height: none !important;
            margin: 0 0 20mm 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
};
