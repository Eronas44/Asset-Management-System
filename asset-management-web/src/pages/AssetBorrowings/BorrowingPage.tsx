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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E6E1D6] pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#2B4C6F] dark:text-[#FAF7F2]">
              Sirkulasi & Peminjaman Aset
            </h1>
            <span className="rounded-full bg-[#F4B752] px-2.5 py-0.5 text-xs font-semibold text-slate-900">
              Sirkulasi Aktif
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pusat monitoring peminjaman dinas, penanggung jawab operasional, dan pengembalian unit inventaris.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2.5 text-xs font-semibold tracking-wider text-[#FAF7F2] shadow-xs transition-all hover:bg-[#162D4A] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:bg-[#1E3A5F] dark:hover:bg-[#25456f]"
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

      {/* Tabel Log Transaksi Peminjaman */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white dark:border-slate-800 dark:bg-[#1A2433] shadow-xs">
        
        {/* Table Top Toolbar */}
        <div className="flex items-center justify-between border-b border-[#E6E1D6] p-4 dark:border-slate-800 bg-[#FAF7F2]/40 dark:bg-[#151D2A]/40">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B4C6F] dark:text-[#FAF7F2]">
              Riwayat Sirkulasi Unit
            </h2>
            <span className="rounded-md border border-[#E6E1D6] bg-[#FAF7F2] px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-300">
              {borrowings.length} Transaksi
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
            <Clock3 size={13} className="text-[#1E3A5F] dark:text-[#F4B752]" />
            <span>Pencatatan Terpadu</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#1E3A5F] dark:border-slate-700 dark:border-t-[#F4B752]" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Memuat berkas catatan sirkulasi...</p>
            </div>
          ) : borrowings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E6E1D6] bg-[#FAF7F2] text-slate-500 dark:border-slate-800 dark:bg-[#111822] dark:text-slate-400">
                <Handshake size={22} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2B4C6F] dark:text-[#FAF7F2]">
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
                  <div key={b.id} className="rounded-xl border border-[#E6E1D6] bg-white p-4 dark:border-slate-800 dark:bg-[#151D2A] shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-[#2B4C6F] dark:text-[#FAF7F2]">
                          {b.asset?.name || <span className="text-rose-600 italic">Aset Telah Dihapus</span>}
                        </h4>
                        <span className="mt-1 inline-block font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-[#FAF7F2] dark:bg-[#111822] px-2 py-0.5 rounded border border-[#E6E1D6] dark:border-slate-800">
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

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-[#FAF7F2]/70 dark:bg-[#111822]/60 p-3 rounded-xl border border-[#E6E1D6] dark:border-slate-800 space-y-1.5">
                      <div>
                        <span className="text-slate-400">Peminjam:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{b.borrower_name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-[#E6E1D6] dark:border-slate-800">
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
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200"
                        >
                          <ArrowLeftRight size={14} className="text-[#1E3A5F] dark:text-[#F4B752]" />
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
                <thead className="bg-[#F4F0EA] text-[#2B4C6F] border-b border-[#E6E1D6] text-[11px] font-semibold uppercase tracking-wider dark:bg-[#151D2A] dark:text-[#FAF7F2] dark:border-b dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3 whitespace-nowrap">Aset Inventaris</th>
                    <th className="px-5 py-3">Nama Peminjam</th>
                    <th className="px-5 py-3 whitespace-nowrap">Waktu Pinjam</th>
                    <th className="px-5 py-3 whitespace-nowrap">Rencana Pengembalian</th>
                    <th className="px-5 py-3 whitespace-nowrap">Status Siklus</th>
                    <th className="px-5 py-3 text-center whitespace-nowrap">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6] dark:divide-slate-800/80">
                  {borrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF7F2]/80 dark:hover:bg-slate-800/40 transition-colors">
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
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E1D6] bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-[#FAF7F2] hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            {actionLoadingId === b.id ? (
                              <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-[#1E3A5F] dark:border-slate-500 dark:border-t-[#F4B752]" />
                                <span>Memproses...</span>
                              </>
                            ) : (
                              <>
                                <ArrowLeftRight size={13} className="text-[#1E3A5F] dark:text-[#F4B752]" />
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
              className="mb-2.5 w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-100 dark:focus:border-[#F4B752]"
            />
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#E6E1D6] bg-white p-2 dark:border-slate-700 dark:bg-[#111822]">
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
                            ? 'border-[#1E3A5F] bg-[#1E3A5F] text-[#FAF7F2] font-medium' 
                            : 'border-[#E6E1D6] bg-white text-slate-700 hover:bg-[#FAF7F2] dark:border-slate-800 dark:bg-[#1A2433] dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-xs leading-snug">{asset.name}</div>
                            <div className={`mt-0.5 font-mono text-[10px] ${selected ? 'text-[#F4B752]' : 'text-slate-400'}`}>
                              {asset.asset_code} · {asset.category?.name || '-'} · {asset.location?.name || '-'}
                            </div>
                          </div>
                          {selected && <CheckCircle2 size={16} className="mt-0.5 text-[#F4B752]" />}
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
              className="w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-100 dark:focus:border-[#F4B752]"
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
              className="w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 py-2 text-xs text-slate-900 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-100 dark:focus:border-[#F4B752]"
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
              className="w-full resize-none rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-700 dark:bg-[#111822] dark:text-slate-100 dark:focus:border-[#F4B752]"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 sm:col-span-2 border-t border-[#E6E1D6] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl border border-[#E6E1D6] bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-[#FAF7F2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-xs transition-all hover:bg-[#162D4A] active:scale-95 focus:ring-2 focus:ring-[#1E3A5F]/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1E3A5F] dark:hover:bg-[#25456f]"
            >
              {submitLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
