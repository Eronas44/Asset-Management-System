import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { assetBorrowingService } from '../../services/asset-borrowing.service';
import { assetService } from '../../services/asset.service';
import type { AssetBorrowing } from '../../types/asset-borrowing';
import type { Asset } from '../../types/asset';
import { Plus, Handshake, CheckCircle2, AlertCircle, ArrowLeftRight, Clock3 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/Feedback/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const BorrowingPage: React.FC = () => {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [borrowings, setBorrowings] = useState<AssetBorrowing[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);

  // State konfirmasi pengembalian aset
  const [returningItem, setReturningItem] = useState<AssetBorrowing | null>(null);

  // Form State
  const [assetId, setAssetId] = useState<number | ''>('');
  const [borrowerName, setBorrowerName] = useState('');
  const [expectedReturnAt, setExpectedReturnAt] = useState('');
  const [notes, setNotes] = useState('');
  const [assetSearch, setAssetSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredAvailableAssets = useMemo(() => {
    const query = assetSearch.trim().toLowerCase();

    if (!query) {
      return availableAssets;
    }

    return availableAssets.filter((asset) => {
      const categoryName = asset.category?.name || '';
      const locationName = asset.location?.name || '';
      const locationCode = asset.location?.code || '';

      return [asset.name, asset.asset_code, categoryName, locationName, locationCode]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [assetSearch, availableAssets]);

  const loadPageData = async () => {
    try {
      const [borrowingsData, assetsData] = await Promise.all([
        assetBorrowingService.getAll(),
        assetService.getAll({ status: 'available', per_page: 1000 })
      ]);
      setBorrowings(borrowingsData);
      setAvailableAssets(assetsData.data || []);
    } catch (err) {
      console.error('Gagal memuat data transaksi peminjaman:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    const borrowAssetId = searchParams.get('borrowAssetId');
    if (borrowAssetId) {
      const parsedId = Number(borrowAssetId);
      if (!isNaN(parsedId) && parsedId > 0) {
        setAssetId(parsedId);
        setIsCreateModalOpen(true);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!assetId) {
      setMessage({ text: 'Silakan pilih aset terlebih dahulu.', isError: true });
      return;
    }

    setSubmitLoading(true);

    const formatDateTime = (value: Date) => {
      const pad = (input: number) => String(input).padStart(2, '0');
      return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
    };

    const formatDateTimeInput = (value: string) => {
      if (!value) return '';
      return `${value.replace('T', ' ')}:00`;
    };

    try {
      const borrowedAt = formatDateTime(new Date());

      await assetBorrowingService.create({
        asset_id: Number(assetId),
        borrower_name: borrowerName,
        borrowed_at: borrowedAt,
        expected_return_at: formatDateTimeInput(expectedReturnAt),
        notes
      });

      const successMsg = 'Transaksi peminjaman berhasil diproses!';
      setMessage({ text: successMsg, isError: false });
      toast.success(successMsg);
      
      setAssetId('');
      setBorrowerName('');
      setExpectedReturnAt('');
      setNotes('');
      setAssetSearch('');
      setIsCreateModalOpen(false);

      loadPageData();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Gagal memproses peminjaman aset.';
      setMessage({ text: errMsg, isError: true });
      toast.error(errMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInitiateReturn = (item: AssetBorrowing) => {
    setReturningItem(item);
  };

  const handleConfirmReturn = async () => {
    if (!returningItem) return;
    
    setMessage(null);
    setActionLoadingId(returningItem.id);

    try {
      await assetBorrowingService.markAsReturned(returningItem.id);
      const successMsg = `Aset "${returningItem.asset?.name}" telah sukses dikembalikan ke inventaris!`;
      setMessage({ text: successMsg, isError: false });
      toast.success(successMsg);
      setReturningItem(null);
      loadPageData();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Gagal memperbarui status pengembalian.';
      setMessage({ text: errMsg, isError: true });
      toast.error(errMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E0D8] pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Sirkulasi & Peminjaman Aset
            </h1>
            <span className="rounded-md border border-[#E2E0D8] bg-white/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-300">
              Circulation Desk
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pusat monitoring peminjaman dinas, penanggung jawab operasional, dan pengembalian unit inventaris.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>+ Peminjaman Baru</span>
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-xs transition-all ${
            message.isError
              ? 'border-rose-500/30 bg-rose-50/80 text-rose-900 dark:border-rose-500/25 dark:bg-rose-950/30 dark:text-rose-200'
              : 'border-emerald-500/30 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-950/30 dark:text-emerald-200'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {message.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          </div>
          <p className="leading-relaxed font-medium">{message.text}</p>
        </div>
      )}

      {/* Tabel Log Transaksi Peminjaman (Bento Card Container) */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E2E0D8] bg-white dark:border-white/10 dark:bg-slate-900/70 shadow-xs backdrop-blur-md">
        
        {/* Table Top Toolbar */}
        <div className="flex items-center justify-between border-b border-[#E2E0D8] p-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Riwayat Sirkulasi Unit
            </h2>
            <span className="rounded-md border border-slate-200/80 bg-slate-100/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {borrowings.length} Transaksi
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
            <Clock3 size={13} />
            <span>Live Audit</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-sky-400" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Memuat berkas catatan sirkulasi...</p>
            </div>
          ) : borrowings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-500">
                <Handshake size={22} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Belum Ada Catatan Peminjaman
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Saat ini belum ada data pergerakan unit atau seluruh aset berada pada lokasi penyimpanan aman.
              </p>
            </div>
          ) : (
            <>
              {/* Tampilan Kartu Khusus Layar Mobile (< md) */}
              <div className="md:hidden space-y-3 p-4">
                {borrowings.map((b) => (
                  <div key={b.id} className="rounded-xl border border-[#E2E0D8] bg-white p-4 dark:border-white/10 dark:bg-slate-850/70 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {b.asset?.name || <span className="text-rose-600 italic">Aset Telah Dihapus</span>}
                        </h4>
                        <span className="mt-1 inline-block font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700">
                          {b.asset?.asset_code}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                        b.returned_at 
                          ? 'border-emerald-800/20 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300' 
                          : 'border-amber-800/20 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        <span>{b.returned_at ? 'Dikembalikan' : 'Dipinjam'}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div>
                        <span className="text-slate-400">Peminjam:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{b.borrower_name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-slate-200/70 dark:border-slate-800">
                        <div>
                          <span className="block text-slate-400">Pinjam:</span>
                          <span className="text-slate-700 dark:text-slate-300">{b.borrowed_at}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Batas:</span>
                          <span className="text-slate-700 dark:text-slate-300">{b.expected_return_at}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      {!b.returned_at ? (
                        <button 
                          onClick={() => handleInitiateReturn(b)}
                          disabled={actionLoadingId === b.id}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <ArrowLeftRight size={14} className="text-blue-600 dark:text-sky-400" />
                          <span>Tutup & Kembalikan</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={14} />
                          <span>Selesai Dikembalikan</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tampilan Tabel Standar Desktop & Tablet (>= md) */}
              <table className="hidden md:table w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100/90 text-slate-700 border-b border-slate-200/90 text-[11px] font-semibold uppercase tracking-wider dark:bg-slate-900/90 dark:text-slate-300 dark:border-b dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3 whitespace-nowrap">Aset Inventaris</th>
                    <th className="px-5 py-3">Nama Peminjam</th>
                    <th className="px-5 py-3 whitespace-nowrap">Waktu Pinjam</th>
                    <th className="px-5 py-3 whitespace-nowrap">Rencana Pengembalian</th>
                    <th className="px-5 py-3 whitespace-nowrap">Status Siklus</th>
                    <th className="px-5 py-3 text-center whitespace-nowrap">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {borrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-100/70 dark:hover:bg-indigo-950/30 transition-all">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {b.asset?.name || <span className="text-rose-600 italic">Aset Telah Dihapus</span>}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {b.asset?.asset_code}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {b.borrower_name}
                        {b.borrowed_by_user_name && (
                          <div className="mt-0.5 text-[10px] text-slate-400">
                            Dicatat: {b.borrowed_by_user_name}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {b.borrowed_at}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {b.expected_return_at}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${
                          b.returned_at 
                            ? 'border-emerald-800/20 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300' 
                            : 'border-amber-800/20 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                          <span>{b.returned_at ? 'Dikembalikan' : 'Sedang Dipinjam'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        {!b.returned_at ? (
                          <button 
                            onClick={() => handleInitiateReturn(b)}
                            disabled={actionLoadingId === b.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            {actionLoadingId === b.id ? (
                              <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-blue-600 dark:border-slate-500 dark:border-t-sky-400" />
                                <span>Memproses...</span>
                              </>
                            ) : (
                              <>
                                <ArrowLeftRight size={13} className="text-blue-600 dark:text-sky-400" />
                                <span>Tutup & Kembalikan</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 size={13} />
                            <span>Selesai</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Modal Form Registrasi Peminjaman */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Form Registrasi Peminjaman"
        description="Pilih aset tersedia dan tetapkan peminjam serta batas waktu pengembalian."
        maxWidthClassName="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Pilih Aset Tersedia <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              placeholder="Cari berdasarkan nama aset, kode inventaris, atau kategori..."
              className="mb-2.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
              {filteredAvailableAssets.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-400">Tidak ada aset tersedia yang sesuai pencarian.</div>
              ) : (
                <div className="space-y-1">
                  {filteredAvailableAssets.map((asset) => {
                    const selected = assetId === asset.id;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => setAssetId(asset.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition-all ${
                          selected 
                            ? 'border-blue-600 bg-blue-600 text-white dark:border-sky-400 dark:bg-sky-400 dark:text-slate-950 font-medium' 
                            : 'border-slate-100 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-xs leading-snug">{asset.name}</div>
                            <div className={`mt-0.5 font-mono text-[10px] ${selected ? 'text-white/80 dark:text-slate-900/80' : 'text-slate-400'}`}>
                              {asset.asset_code} · {asset.category?.name || '-'} · {asset.location?.name || '-'}
                            </div>
                          </div>
                          {selected && <CheckCircle2 size={16} className="mt-0.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nama Lengkap Peminjam <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              required
              placeholder="Contoh: Budi Santoso (Divisi Operasional)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Rencana Waktu Pengembalian <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={expectedReturnAt}
              onChange={(e) => setExpectedReturnAt(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Keperluan & Catatan Peminjaman
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jelaskan kebutuhan operasional dan kondisi unit saat diserahkan..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 sm:col-span-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
            >
              {submitLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-slate-950/40 dark:border-t-slate-950" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Proses Peminjaman</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Pengembalian Aset */}
      <ConfirmDialog
        isOpen={returningItem !== null}
        title="Konfirmasi Pengembalian Aset"
        message={`Apakah Anda yakin ingin memproses pengembalian unit "${returningItem?.asset?.name}" yang dipinjam oleh ${returningItem?.borrower_name}?\n\nStatus inventaris unit akan otomatis dipulihkan menjadi Tersedia.`}
        confirmLabel="Konfirmasi Pengembalian"
        cancelLabel="Batal"
        variant="info"
        isLoading={actionLoadingId !== null}
        onConfirm={handleConfirmReturn}
        onCancel={() => setReturningItem(null)}
      />
    </div>
  );
};

export default BorrowingPage;
