import React, { useEffect, useState } from 'react';
import { assetCategoryService } from '../../services/asset-category.service';
import type { AssetCategory } from '../../types/asset-category';
import { Plus, Tag, CheckCircle2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/Feedback/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const CategoryPage: React.FC = () => {
  const toast = useToast();
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<AssetCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchCategories = async () => {
    try {
      const data = await assetCategoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitLoading(true);

    try {
      await assetCategoryService.create({ name, description });
      const successText = 'Kategori aset berhasil ditambahkan.';
      setMessage({ text: successText, isError: false });
      toast.success(successText);
      setName('');
      setDescription('');
      setIsCreateModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const errText = apiErr.response?.data?.message || 'Gagal menambahkan kategori aset.';
      setMessage({ text: errText, isError: true });
      toast.error(errText);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenEdit = (category: AssetCategory) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setMessage(null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setMessage(null);
    setSubmitLoading(true);

    try {
      await assetCategoryService.update(editingCategory.id, {
        name: editName,
        description: editDescription
      });
      const updateMsg = `Kategori "${editName}" berhasil diperbarui.`;
      setMessage({ text: updateMsg, isError: false });
      toast.success(updateMsg);
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const errText = apiErr.response?.data?.message || 'Gagal memperbarui kategori aset.';
      setMessage({ text: errText, isError: true });
      toast.error(errText);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInitiateDelete = (category: AssetCategory) => {
    setDeletingCategory(category);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    setMessage(null);
    setDeleteLoading(true);
    try {
      await assetCategoryService.delete(deletingCategory.id);
      const delMsg = `Kategori "${deletingCategory.name}" berhasil dihapus.`;
      setMessage({ text: delMsg, isError: false });
      toast.success(delMsg);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const errText = apiErr.response?.data?.message || 'Gagal menghapus kategori aset.';
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
              Kategori Aset Inventaris
            </h1>
            <span className="rounded border border-slate-200/90 bg-slate-100/70 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
              Klasifikasi
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kelola taksonomi dan klasifikasi kelompok aset untuk mempermudah pelaporan serta perhitungan penyusutan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-slate-800 focus:outline-none dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Tambah Kategori</span>
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

      {/* Categories Table Container */}
      <div className="flex flex-col overflow-hidden rounded-md border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200/90 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Daftar Kategori Aktif
            </h2>
            <span className="rounded border border-slate-200 bg-slate-100/80 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {categories.length} Kategori
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-200" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Memuat data klasifikasi kategori...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-500">
                <Tag size={20} />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Belum Ada Kategori
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Belum ada data kategori aset yang terdaftar. Tambahkan kategori baru untuk mulai mengklasifikasikan aset.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap w-20">ID</th>
                  <th className="px-4 py-3">Nama Kategori</th>
                  <th className="px-4 py-3">Deskripsi & Ruang Lingkup</th>
                  <th className="px-4 py-3 whitespace-nowrap">Tanggal Registrasi</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      #{category.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 max-w-md">
                      {category.description || <span className="italic text-slate-400 dark:text-slate-500">Tidak ada deskripsi tambahan</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                      {new Date(category.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(category)}
                          title="Edit Kategori"
                          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Pencil size={12} className="text-slate-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateDelete(category)}
                          title="Hapus Kategori"
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

      {/* Modal Tambah Kategori */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrasi Kategori Aset"
        description="Definisikan nama klasifikasi dan deskripsi fungsional untuk kategori aset baru."
        maxWidthClassName="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nama Kategori <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Perangkat IT, Kendaraan Operasional, Mesin Produksi..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Deskripsi & Catatan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rincian jenis aset yang tercakup dalam klasifikasi ini..."
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
              {submitLoading ? 'Menyimpan...' : <><CheckCircle2 size={14} /> Simpan Kategori</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Kategori */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Kategori Aset"
        description="Perbarui informasi nama dan deskripsi klasifikasi kategori terpilih."
        maxWidthClassName="max-w-lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nama Kategori <span className="text-rose-600 dark:text-rose-400">*</span>
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
              Deskripsi & Catatan
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

      {/* Dialog Konfirmasi Hapus Kategori */}
      <ConfirmDialog
        isOpen={deletingCategory !== null}
        title="Hapus Kategori Aset"
        message={`Apakah Anda yakin ingin menghapus kategori "${deletingCategory?.name}"?\nData akan dinonaktifkan (Soft Delete).`}
        confirmLabel="Hapus Kategori"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
};

export default CategoryPage;
