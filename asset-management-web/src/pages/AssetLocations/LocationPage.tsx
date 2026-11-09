import React, { useEffect, useState } from 'react';
import { assetLocationService } from '../../services/asset-location.service';
import type { AssetLocation } from '../../types/asset-location';
import { Plus, MapPin, CheckCircle2, AlertCircle, Pencil, Trash2, Search, Calendar, Building2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/Feedback/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const LocationPage: React.FC = () => {
  const toast = useToast();
  const [locations, setLocations] = useState<AssetLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (loc.description && loc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans text-[#0F172A] dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E0D8] pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              Lokasi & Fasilitas Penempatan
            </h1>
            <span className="rounded-full border border-blue-500/30 bg-blue-50/80 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:border-sky-500/30 dark:bg-sky-950/50 dark:text-sky-300">
              Fasilitas Fisik
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Daftar lokasi gedung, lantai, dan ruangan penyimpanan untuk memetakan penempatan fisik seluruh aset perusahaan.
          </p>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="min-h-[44px] sm:min-h-[40px] inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah Lokasi</span>
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

      {/* Locations Bento Module Container */}
      <div className="flex flex-col overflow-hidden rounded-3xl border border-[#E2E0D8] bg-white shadow-sm dark:border-white/10 dark:bg-[#111827]/80 dark:backdrop-blur-xl">
        
        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E0D8] p-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Building2 size={16} className="text-blue-600 dark:text-sky-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-slate-200">
              Daftar Lokasi Aktif
            </h2>
            <span className="rounded-full border border-[#E2E0D8] bg-[#F4F3EF] px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              {filteredLocations.length} Lokasi
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
              placeholder="Cari nama atau kode lokasi..."
              className="w-full rounded-xl border border-[#E2E0D8] bg-[#F4F3EF]/60 py-1.5 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
            />
          </div>
        </div>

        {/* Content Body */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[#E2E0D8] border-t-blue-600 dark:border-slate-700 dark:border-t-sky-400" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Memuat data lokasi penempatan...</p>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center p-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E2E0D8] bg-[#F4F3EF] text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-500">
                <MapPin size={22} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-slate-200">
                Belum Ada Lokasi
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                {searchQuery ? `Tidak ditemukan lokasi yang sesuai dengan "${searchQuery}".` : 'Belum ada data lokasi fasilitas yang terdaftar. Tambahkan lokasi baru untuk mulai memetakan penempatan aset.'}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (hidden md:table) with Dark Translucent Header & Floating Rows */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="border-b border-[#E2E0D8] bg-slate-100/90 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:border-b dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                    <tr>
                      <th className="px-5 py-3.5 whitespace-nowrap w-20">ID</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Kode Lokasi</th>
                      <th className="px-5 py-3.5">Nama Fasilitas / Ruangan</th>
                      <th className="px-5 py-3.5">Deskripsi</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Tanggal Registrasi</th>
                      <th className="px-5 py-3.5 text-right whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E0D8] dark:divide-white/10">
                    {filteredLocations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-100/70 dark:hover:bg-indigo-950/30 transition-all">
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-slate-400">
                          #{loc.id}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/80 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300">
                            {loc.code}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-[#0F172A] dark:text-white">
                            {loc.name}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 max-w-md">
                          {loc.description || <span className="italic text-slate-400 dark:text-slate-500">Tidak ada deskripsi</span>}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                          {new Date(loc.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(loc)}
                              title="Edit Lokasi"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E0D8] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-[#F4F3EF] hover:border-blue-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              <Pencil size={13} className="text-blue-600 dark:text-sky-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInitiateDelete(loc)}
                              title="Hapus Lokasi"
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
                {filteredLocations.map((loc) => (
                  <div 
                    key={loc.id}
                    className="rounded-2xl border border-[#E2E0D8] bg-white p-4 shadow-2xs dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300">
                          {loc.code}
                        </span>
                        <h4 className="text-xs font-bold text-[#0F172A] dark:text-white mt-1.5">
                          {loc.name}
                        </h4>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        #{loc.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      {loc.description || <span className="italic text-slate-400">Tidak ada deskripsi</span>}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E2E0D8] dark:border-white/10">
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                        <Calendar size={12} />
                        <span>
                          {new Date(loc.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(loc)}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1 rounded-xl border border-[#E2E0D8] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#F4F3EF] dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <Pencil size={13} className="text-blue-600 dark:text-sky-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateDelete(loc)}
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

      {/* Modal Tambah Lokasi */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrasi Lokasi / Fasilitas"
        description="Daftarkan kode dan nama ruangan atau gedung penempatan aset fisik."
        maxWidthClassName="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Kode Lokasi <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Contoh: L1-SRV-01, GD-B-R204..."
              className="w-full rounded-xl border border-[#E2E0D8] bg-white px-3.5 py-2 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20 font-mono"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nama Fasilitas / Ruangan <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Ruang Server Utama Lantai 1..."
              className="w-full rounded-xl border border-[#E2E0D8] bg-white px-3.5 py-2 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Deskripsi & Rincian Gedung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan akses keamanan, nomor gedung, atau penanggung jawab..."
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
              {submitLoading ? 'Menyimpan...' : <><CheckCircle2 size={14} /> Simpan Lokasi</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Lokasi */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Lokasi Penempatan"
        description="Perbarui informasi kode, nama, dan deskripsi fasilitas fisik terpilih."
        maxWidthClassName="max-w-lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Kode Lokasi <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              required
              className="w-full rounded-xl border border-[#E2E0D8] bg-white px-3.5 py-2 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20 font-mono"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nama Fasilitas / Ruangan <span className="text-rose-600 dark:text-rose-400">*</span>
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
              Deskripsi & Rincian Gedung
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
              {submitLoading ? 'Menyimpan...' : <><CheckCircle2 size={14} /> Perbarui Lokasi</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingLocation)}
        title="Hapus Lokasi Fasilitas"
        message={`Apakah Anda yakin ingin menghapus lokasi "${deletingLocation?.name}" (${deletingLocation?.code})? Data aset yang terikat pada lokasi ini mungkin perlu dipindahkan.`}
        confirmLabel="Ya, Hapus Lokasi"
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
