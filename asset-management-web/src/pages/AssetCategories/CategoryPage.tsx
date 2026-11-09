import React, { useEffect, useState } from 'react';
import { assetCategoryService } from '../../services/asset-category.service';
import type { AssetCategory } from '../../types/asset-category';
import { Plus, Tag, CheckCircle2, AlertCircle, Pencil, Trash2, Search, Calendar, FolderOpen } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/Feedback/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const CategoryPage: React.FC = () => {
  const toast = useToast();
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans text-[#0F172A] dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E0D8] pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              Kategori Aset Inventaris
            </h1>
            <span className="rounded-full border border-blue-500/30 bg-blue-50/80 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:border-sky-500/30 dark:bg-sky-950/50 dark:text-sky-300">
              Klasifikasi Master
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kelola taksonomi dan klasifikasi kelompok aset untuk mempermudah pelaporan serta perhitungan penyusutan.
          </p>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="min-h-[44px] sm:min-h-[40px] inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs ${
            message.isError
              ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
              : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          <div className="mt-0.5">
            {message.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          </div>
          <p className="font-semibold">{message.text}</p>
        </div>
      )}

      {/* Categories Bento Module Container */}
      <div className="flex flex-col overflow-hidden rounded-3xl border border-[#E2E0D8] bg-white shadow-sm dark:border-white/10 dark:bg-[#111827]/80 dark:backdrop-blur-xl">
        
        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E0D8] p-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <FolderOpen size={16} className="text-blue-600 dark:text-sky-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-slate-200">
              Daftar Kategori Aktif
            </h2>
            <span className="rounded-full border border-[#E2E0D8] bg-[#F4F3EF] px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              {filteredCategories.length} Kategori
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kategori aset..."
              className="w-full rounded-xl border border-[#E2E0D8] bg-[#F4F3EF]/60 py-1.5 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
            />
          </div>
        </div>

        {/* Content Body */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[#E2E0D8] border-t-blue-600 dark:border-slate-700 dark:border-t-sky-400" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Memuat data klasifikasi kategori...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center p-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E2E0D8] bg-[#F4F3EF] text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-500">
                <Tag size={22} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-slate-200">
                Belum Ada Kategori
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                {searchQuery ? `Tidak ditemukan kategori yang sesuai dengan "${searchQuery}".` : 'Belum ada data kategori aset yang terdaftar. Tambahkan kategori baru untuk mulai mengklasifikasikan aset.'}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (hidden md:table) with Dark Translucent Header & Floating Rows */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="border-b border-[#E2E0D8] bg-slate-100/90 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:border-b dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                    <tr>
                      <th className="px-5 py-3.5 whitespace-nowrap w-24">ID</th>
                      <th className="px-5 py-3.5">Nama Kategori</th>
                      <th className="px-5 py-3.5">Deskripsi & Ruang Lingkup</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Tanggal Registrasi</th>
                      <th className="px-5 py-3.5 text-right whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E0D8] dark:divide-white/10">
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-100/70 dark:hover:bg-indigo-950/30 transition-all">
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300">
                            #{category.id}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-[#0F172A] dark:text-white">
                            {category.name}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 max-w-md">
                          {category.description || <span className="italic text-slate-400 dark:text-slate-500">Tidak ada deskripsi tambahan</span>}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                          {new Date(category.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(category)}
                              title="Edit Kategori"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E0D8] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-[#F4F3EF] hover:border-blue-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              <Pencil size={13} className="text-blue-600 dark:text-sky-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInitiateDelete(category)}
                              title="Hapus Kategori"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-2xs transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40 cursor-pointer"
                            >
                              <Trash2 size={13} className="text-rose-600 dark:text-rose-400" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE PORTRAIT CARD VIEW (< md) - Stacked Bento Cards */}
              <div className="md:hidden space-y-3 p-4">
                {filteredCategories.map((category) => (
                  <div 
                    key={category.id}
                    className="rounded-2xl border border-[#E2E0D8] bg-white p-4 shadow-2xs dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300">
                          #{category.id}
                        </span>
                        <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                          {category.name}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      {category.description || <span className="italic text-slate-400">Tidak ada deskripsi tambahan</span>}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E2E0D8] dark:border-white/10">
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                        <Calendar size={12} />
                        <span>
                          {new Date(category.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(category)}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1 rounded-xl border border-[#E2E0D8] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <Pencil size={13} className="text-blue-600 dark:text-sky-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateDelete(category)}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                        >
                          <Trash2 size={13} className="text-rose-600 dark:text-rose-400" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nama Kategori <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Perangkat IT, Kendaraan Operasional, Mesin Produksi..."
              className="w-full rounded-xl border border-[#E2E0D8] bg-white px-3.5 py-2 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Deskripsi & Catatan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rincian jenis aset yang tercakup dalam klasifikasi ini..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#E2E0D8] bg-white px-3.5 py-2 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E0D8] dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="min-h-[38px] rounded-xl border border-[#E2E0D8] bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="min-h-[38px] inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 cursor-pointer"
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
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nama Kategori <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full rounded-xl border border-[#E2E0D8] bg-white px-3.5 py-2 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Deskripsi & Catatan
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-[#E2E0D8] bg-white px-3.5 py-2 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E0D8] dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="min-h-[38px] rounded-xl border border-[#E2E0D8] bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="min-h-[38px] inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 cursor-pointer"
            >
              {submitLoading ? 'Menyimpan...' : <><CheckCircle2 size={14} /> Perbarui Perubahan</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        title="Hapus Kategori Aset"
        message={`Apakah Anda yakin ingin menghapus kategori "${deletingCategory?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Kategori"
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
