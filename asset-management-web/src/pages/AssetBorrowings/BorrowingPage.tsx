import React, { useEffect, useMemo, useState } from 'react';
import { assetBorrowingService } from '../../services/asset-borrowing.service';
import { assetService } from '../../services/asset.service';
import { useAuth } from '../../context/AuthContext';
import type { AssetBorrowing } from '../../types/asset-borrowing';
import type { Asset } from '../../types/asset';
import { Plus, Handshake, CheckCircle2, AlertCircle, ArrowLeftRight } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const BorrowingPage: React.FC = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<AssetBorrowing[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);

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

  // Fungsi tersentralisasi untuk memuat ulang seluruh data komponen
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

  // Fungsi menangani submit form peminjaman baru
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

      setMessage({ text: 'Transaksi peminjaman berhasil diproses!', isError: false });
      
      setAssetId('');
      setBorrowerName('');
      setExpectedReturnAt('');
      setNotes('');
      setAssetSearch('');
      setIsCreateModalOpen(false);

      loadPageData();
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage({ text: err.response.data.message, isError: true });
      } else {
        setMessage({ text: 'Gagal memproses peminjaman aset.', isError: true });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Fungsi menangani aksi klik tombol pengembalian aset
  const handleReturn = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin memproses pengembalian aset ini?')) return;
    
    setMessage(null);
    setActionLoadingId(id);

    try {
      await assetBorrowingService.markAsReturned(id);
      setMessage({ text: 'Aset sukses dikembalikan, status inventaris telah diperbarui!', isError: false });
      
      // Strategi arsitektur terpusat: refresh data setelah aksi berhasil
      loadPageData();
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage({ text: err.response.data.message, isError: true });
      } else {
        setMessage({ text: 'Gagal memproses pengembalian aset.', isError: true });
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Modul Peminjaman & Pengembalian Aset</h2>
          <p className="mt-1 text-gray-500 dark:text-slate-400">Kelola transaksi sirkulasi peminjaman aset inventaris.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Disimpan atas nama user login: <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name || '-'}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-medium text-white transition-colors hover:bg-amber-600"
        >
          <Plus size={18} /> Peminjaman Baru
        </button>
      </div>

      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${
          message.isError ? 'border-red-100 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100' : 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100'
        }`}>
          <div className="mt-0.5">
            {message.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <p>{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Plus size={20} />
            </div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">Form Peminjaman Baru</h4>
          </div>

          <p className="text-sm leading-6 text-gray-500 dark:text-slate-400">
            Buka modal lebar untuk input peminjaman baru, agar detail aset, jadwal, dan catatan lebih lega diisi.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-medium text-white transition-colors hover:bg-amber-600"
          >
            <CheckCircle2 size={18} /> Proses Peminjaman
          </button>
        </div>

        {/* Tabel Log Riwayat Transaksi */}
        <div className="xl:col-span-2 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-800">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">Riwayat Transaksi & Aksi Pengembalian</h4>
            <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Total: {borrowings.length}
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-slate-400">
                <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p>Memuat riwayat peminjaman...</p>
              </div>
            ) : borrowings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-slate-800 dark:text-slate-500">
                  <Handshake size={32} />
                </div>
                <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white">Belum ada transaksi</h3>
                <p className="max-w-sm text-gray-500 dark:text-slate-400">Belum ada rekaman transaksi peminjaman. Silakan proses form di samping untuk membuat transaksi baru.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
                <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Nama Aset</th>
                    <th className="px-6 py-4">Peminjam</th>
                    <th className="px-6 py-4">Tanggal Pinjam</th>
                    <th className="px-6 py-4">Rencana Kembali</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status Log</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {borrowings.map((b) => (
                    <tr key={b.id} className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-slate-800/70">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 transition-colors group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-300">
                          {b.asset?.name || <span className="text-red-500 italic">Aset Terhapus</span>}
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-gray-500 dark:text-slate-400">{b.asset?.asset_code}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700 dark:text-slate-200">{b.borrower_name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-slate-400">
                        {b.borrowed_at}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-slate-400">
                        {b.expected_return_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                          b.returned_at ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100'
                        }`}>
                          {b.returned_at ? 'Dikembalikan' : 'Dipinjam'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {!b.returned_at ? (
                          <button 
                            onClick={() => handleReturn(b.id)}
                            disabled={actionLoadingId === b.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {actionLoadingId === b.id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>...</span>
                              </>
                            ) : (
                              <>
                                <ArrowLeftRight size={14} />
                                Kembalikan
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                            <CheckCircle2 size={14} />
                            Selesai
                          </div>
                        )}
                        {b.borrowed_by_user_name && (
                          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                            Input oleh: <span className="font-semibold text-slate-700 dark:text-slate-200">{b.borrowed_by_user_name}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Form Peminjaman Baru"
        description="Gunakan modal lebar ini untuk menginput transaksi peminjaman secara lengkap."
        maxWidthClassName="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">
              Pilih Aset (Hanya status Available) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              placeholder="Cari aset berdasarkan nama, kode, kategori, atau lokasi..."
              className="mb-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-slate-700 dark:bg-slate-800">
              {filteredAvailableAssets.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 dark:text-slate-400">Tidak ada aset yang cocok.</div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableAssets.map((asset) => {
                    const selected = assetId === asset.id;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => setAssetId(asset.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${selected ? 'border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100' : 'border-transparent bg-white text-gray-700 hover:border-amber-200 hover:bg-amber-50 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-amber-500/20 dark:hover:bg-slate-700'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">{asset.name}</div>
                            <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{asset.asset_code}</div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                              {asset.category?.name || '-'} · {asset.location?.name || '-'}
                            </div>
                          </div>
                          {selected && <CheckCircle2 size={16} className="mt-0.5 text-amber-600 dark:text-amber-300" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              {assetId ? 'Aset terpilih. Tanggal dan waktu pinjam akan diisi otomatis saat proses disimpan.' : 'Pilih satu aset dari daftar di atas.'}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">
              Nama Peminjam <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              required
              placeholder="Masukkan nama karyawan"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">
              Rencana Tanggal Pengembalian <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={expectedReturnAt}
              onChange={(e) => setExpectedReturnAt(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">
              Catatan / Keterangan Keperluan
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis alasan peminjaman..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-medium text-white transition-colors hover:bg-amber-600 focus:ring-4 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Proses Peminjaman</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BorrowingPage;
