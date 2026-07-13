import React, { useEffect, useState } from 'react';
import { assetLocationService } from '../../services/asset-location.service';
import type { AssetLocation } from '../../types/asset-location';
import { Plus, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const LocationPage: React.FC = () => {
  const [locations, setLocations] = useState<AssetLocation[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fungsi memuat daftar lokasi dari API
  const fetchLocations = async () => {
    try {
      const data = await assetLocationService.getAll();
      setLocations(data);
    } catch (err) {
      console.error('Gagal memuat lokasi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Fungsi menangani submit form tambah lokasi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitLoading(true);

    try {
      await assetLocationService.create({ name, code, description });
      setMessage({ text: 'Lokasi aset berhasil ditambahkan!', isError: false });
      setName('');
      setCode('');
      setDescription('');
      setIsCreateModalOpen(false);
      // Memperbarui daftar lokasi tanpa refresh browser
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage({ text: err.response.data.message, isError: true });
      } else {
        setMessage({ text: 'Gagal menambahkan lokasi.', isError: true });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-800 dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Lokasi Aset</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Kelola daftar lokasi untuk pelacakan fisik penempatan aset Anda.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={18} /> Tambah Lokasi
        </button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-800">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">Daftar Lokasi Aktif</h4>
            <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Total: {locations.length}
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-slate-400">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p>Memuat data lokasi...</p>
              </div>
            ) : locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-slate-800 dark:text-slate-500">
                  <MapPin size={32} />
                </div>
                <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white">Belum ada lokasi</h3>
                <p className="max-w-sm text-gray-500 dark:text-slate-400">Anda belum menambahkan lokasi aset apa pun. Silakan tambahkan lokasi baru melalui form di samping.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
                <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">ID</th>
                    <th className="px-6 py-4">Kode</th>
                    <th className="px-6 py-4">Nama Lokasi</th>
                    <th className="px-6 py-4">Deskripsi</th>
                    <th className="px-6 py-4 whitespace-nowrap">Tanggal Dibuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-slate-800/70">
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-slate-400">#{loc.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {loc.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                          {loc.name}
                        </div>
                      </td>
                      <td className="max-w-xs truncate px-6 py-4 text-gray-500 dark:text-slate-400">
                        {loc.description || <span className="italic text-gray-400 dark:text-slate-500">Tidak ada deskripsi</span>}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-slate-400">
                        {new Date(loc.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
      </div>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah Lokasi"
        description="Tambahkan lokasi baru melalui panel lebar agar input lebih nyaman."
        maxWidthClassName="max-w-2xl"
      >
        {message && (
          <div className={`mb-6 rounded-xl border p-4 text-sm flex items-start gap-3 ${
            message.isError ? 'bg-red-50 text-red-700 border-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100'
          }`}>
            <div className="mt-0.5">
              {message.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            </div>
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">
              Nama Lokasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Misal: Gedung A, Ruang Rapat..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">
              Kode Lokasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Misal: LOC-001, G-A..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-mono uppercase text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan opsional mengenai lokasi ini..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Simpan Lokasi</span>
              </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default LocationPage;
