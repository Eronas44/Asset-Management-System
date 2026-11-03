import React, { useEffect, useState } from 'react';
import { assetLocationService } from '../../services/asset-location.service';
import type { AssetLocation } from '../../types/asset-location';
import { Plus, MapPin, CheckCircle2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/Feedback/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const LocationPage: React.FC = () => {
  const toast = useToast();
  const [locations, setLocations] = useState<AssetLocation[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AssetLocation | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<AssetLocation | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitLoading(true);

    try {
      await assetLocationService.create({ name, code, description });
      const successText = 'Lokasi aset berhasil ditambahkan.';
      setMessage({ text: successText, isError: false });
      toast.success(successText);
      setName('');
      setCode('');
      setDescription('');
      setIsCreateModalOpen(false);
      fetchLocations();
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const errText = apiErr.response?.data?.message || 'Gagal menambahkan lokasi aset.';
      setMessage({ text: errText, isError: true });
      toast.error(errText);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenEdit = (loc: AssetLocation) => {
    setEditingLocation(loc);
    setEditName(loc.name);
    setEditCode(loc.code || '');
    setEditDescription(loc.description || '');
    setMessage(null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    setMessage(null);
    setSubmitLoading(true);

    try {
      await assetLocationService.update(editingLocation.id, {
        name: editName,
        code: editCode,
        description: editDescription
      });
      const updateMsg = `Lokasi "${editName}" berhasil diperbarui.`;
      setMessage({ text: updateMsg, isError: false });
      toast.success(updateMsg);
      setIsEditModalOpen(false);
      fetchLocations();
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const errText = apiErr.response?.data?.message || 'Gagal memperbarui lokasi aset.';
      setMessage({ text: errText, isError: true });
      toast.error(errText);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInitiateDelete = (loc: AssetLocation) => {
    setDeletingLocation(loc);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLocation) return;

    setMessage(null);
    setDeleteLoading(true);
    try {
      await assetLocationService.delete(deletingLocation.id);
      const delMsg = `Lokasi "${deletingLocation.name}" berhasil dihapus.`;
      setMessage({ text: delMsg, isError: false });
      toast.success(delMsg);
      setDeletingLocation(null);
      fetchLocations();
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const errText = apiErr.response?.data?.message || 'Gagal menghapus lokasi aset.';
      setMessage({ text: errText, isError: true });
      toast.error(errText);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5 font-sans text-slate-800 dark:text-slate-100">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Lokasi & Fasilitas Penempatan
            </h1>
            <span className="rounded border border-slate-200/90 bg-slate-100/70 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
              Fasilitas Fisik
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Daftar lokasi gedung, lantai, dan ruangan penyimpanan untuk memetakan penempatan fisik seluruh aset perusahaan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-slate-800 focus:outline-none dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Tambah Lokasi</span>
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2.5 rounded-md border p-3 text-xs ${
            message.isError
              ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          <div className="mt-0.5">
            {message.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          </div>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Locations Table Container */}
      <div className="flex flex-col overflow-hidden rounded-md border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200/90 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Daftar Lokasi Aktif
            </h2>
            <span className="rounded border border-slate-200 bg-slate-100/80 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {locations.length} Lokasi
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-200" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Memuat data lokasi penempatan...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-500">
                <MapPin size={20} />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Belum Ada Lokasi
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Belum ada data lokasi fasilitas yang terdaftar. Tambahkan lokasi baru untuk mulai memetakan penempatan aset.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap w-20">ID</th>
                  <th className="px-4 py-3 whitespace-nowrap">Kode Lokasi</th>
                  <th className="px-4 py-3">Nama Fasilitas / Ruangan</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3 whitespace-nowrap">Tanggal Registrasi</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      #{loc.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {loc.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {loc.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 max-w-md">
                      {loc.description || <span className="italic text-slate-400 dark:text-slate-500">Tidak ada deskripsi</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                      {new Date(loc.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(loc)}
                          title="Edit Lokasi"
                          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Pencil size={12} className="text-slate-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateDelete(loc)}
                          title="Hapus Lokasi"
                          className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 shadow-2xs transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                        >
                          <Trash2 size={12} className="text-rose-600 dark:text-rose-400" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Tambah Lokasi */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrasi Lokasi Fasilitas"
        description="Definisikan kode penempatan, nama area atau ruangan, dan catatan spesifikasi fisik."
        maxWidthClassName="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nama Lokasi <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Gedung A - Lt. 3, Ruang Server Utama..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Kode Lokasi <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Contoh: LOC-GA-03, SRV-HQ-01..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono uppercase text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Deskripsi & Titik Akses
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan rute akses, batas keamanan, atau penanggung jawab area..."
              rows={3}
              className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              {submitLoading ? 'Menyimpan...' : <><CheckCircle2 size={14} /> Simpan Lokasi</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Lokasi */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Lokasi Fasilitas"
        description="Perbarui nama fasilitas, kode ruangan, dan deskripsi penempatan aset."
        maxWidthClassName="max-w-lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nama Lokasi <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Kode Lokasi <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              required
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono uppercase text-xs text-slate-900 outline-none transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Deskripsi & Titik Akses
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              {submitLoading ? 'Memperbarui...' : <><CheckCircle2 size={14} /> Simpan Perubahan</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Hapus Lokasi */}
      <ConfirmDialog
        isOpen={deletingLocation !== null}
        title="Hapus Lokasi Penempatan"
        message={`Apakah Anda yakin ingin menghapus lokasi "${deletingLocation?.name} (${deletingLocation?.code})"?\nData akan dinonaktifkan (Soft Delete).`}
        confirmLabel="Hapus Lokasi"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingLocation(null)}
      />
    </div>
  );
};

export default LocationPage;
