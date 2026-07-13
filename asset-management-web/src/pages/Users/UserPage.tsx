import React, { useEffect, useState } from 'react';
import { userService } from '../../services/user.service';
import type { UserData } from '../../types/user';
import { LoadingIndicator } from '../../components/Feedback/LoadingIndicator';
import { ErrorMessage } from '../../components/Feedback/ErrorMessage';
import { extractErrorMessage } from '../../utils/error';
import { BadgePlus, CheckCircle2, ChevronLeft, ChevronRight, CircleUserRound, Users } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ message: string; traceId?: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setErrorDetails(null);
    try {
      const response = await userService.getAll(page);
      setUsers(response.data);
      setCurrentPage(response.meta.current_page);
      setLastPage(response.meta.last_page);
    } catch (err) {
      const extracted = extractErrorMessage(err);
      setErrorDetails({ message: extracted.message, traceId: extracted.traceId });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitLoading(true);

    try {
      await userService.create({ name, email, password, role });
      setMessage({ text: 'Akun pengguna baru berhasil terdaftar!', isError: false });
      setName('');
      setEmail('');
      setPassword('');
      setRole('staff');
      setIsCreateModalOpen(false);
      fetchUsers(1); // Refresh data dari API, reset ke halaman 1
    } catch (err: any) {
      console.error(err);
      const extracted = extractErrorMessage(err);
      setMessage({ text: extracted.message, isError: true });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    setMessage(null);
    try {
      await userService.updateRole(id, newRole);
      setMessage({ text: 'Peran pengguna berhasil diperbarui!', isError: false });
      fetchUsers(currentPage); // Refresh data dari API setelah sukses aksi
    } catch (err) {
      console.error(err);
      const extracted = extractErrorMessage(err);
      setMessage({ text: `Gagal mengubah peran: ${extracted.message}`, isError: true });
    }
  };

  if (loading && users.length === 0) return <LoadingIndicator message="Memuat data manajemen pengguna..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-slate-800 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300 mb-3">
            <Users size={14} /> User Management
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Kelola Pengguna</h2>
          <p className="mt-1 text-gray-500 dark:text-slate-400">Registrasi akun baru dan ubah peran akses pengguna dari panel ini.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <BadgePlus size={18} /> Tambah Akun
        </button>
      </div>

      {errorDetails && <ErrorMessage message={errorDetails.message} traceId={errorDetails.traceId} />}
      {message && (
        <div className={`max-w-2xl rounded-xl border px-4 py-3 text-sm font-medium ${message.isError ? 'border-red-100 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100' : 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100'}`}>
          {message.text}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">Daftar Akun Terdaftar</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Kelola role dan akses untuk setiap pengguna aktif.</p>
          </div>
          <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Total: {users.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
            <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 whitespace-nowrap">Role Aktif</th>
                <th className="px-6 py-4 whitespace-nowrap">Tanggal Dibuat</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-slate-800/70">
                  <td className="px-6 py-4 font-semibold text-gray-800 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${u.roles.includes('admin') ? 'bg-rose-50 text-rose-700 border-rose-200 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100' : 'bg-slate-50 text-slate-700 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                      {u.roles.join(', ') || 'No Role'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-slate-400">{new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-2">
                      <CircleUserRound size={16} className="text-gray-400 dark:text-slate-500" />
                      <select 
                        value={u.roles[0] || 'staff'} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/40 px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
          <span className="text-sm text-gray-600 dark:text-slate-300">
            Halaman <strong>{currentPage}</strong> dari <strong>{lastPage}</strong>
          </span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))} disabled={currentPage === lastPage} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah Akun Baru"
        description="Buat akun pengguna baru lewat form lebar agar detail akses lebih mudah diisi."
        maxWidthClassName="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Email Akses <span className="text-red-500">*</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Kata Sandi <span className="text-red-500">*</span></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200">Peran Utama <span className="text-red-500">*</span></label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={submitLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70">
            {submitLoading ? 'Mendaftarkan...' : <><CheckCircle2 size={18} /> Daftarkan Akun</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserPage;
