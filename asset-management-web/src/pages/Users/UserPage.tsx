import React, { useEffect, useState } from 'react';
import { userService } from '../../services/user.service';
import type { UserData } from '../../types/user';
import { LoadingIndicator } from '../../components/Feedback/LoadingIndicator';
import { ErrorMessage } from '../../components/Feedback/ErrorMessage';
import { extractErrorMessage } from '../../utils/error';
import { ChevronLeft, ChevronRight, Plus, ShieldCheck, UserCheck } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Feedback/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const UserPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ message: string; traceId?: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // State Konfirmasi Perubahan Peran
  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    userId: number;
    userName: string;
    newRole: string;
  } | null>(null);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);

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
      const successText = 'Akun pengguna baru berhasil didaftarkan ke sistem.';
      setMessage({ text: successText, isError: false });
      toast.success(successText);
      setName('');
      setEmail('');
      setPassword('');
      setRole('staff');
      setIsCreateModalOpen(false);
      fetchUsers(1);
    } catch (err: unknown) {
      console.error(err);
      const extracted = extractErrorMessage(err);
      setMessage({ text: extracted.message, isError: true });
      toast.error(extracted.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const initiateRoleChange = (id: number, newRole: string, userName: string) => {
    if (currentUser?.id === id) {
      toast.error('Anda tidak dapat mengubah peran akun Anda sendiri demi mencegah penguncian hak akses.');
      return;
    }

    setRoleChangeTarget({ userId: id, userName, newRole });
  };

  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget) return;

    setRoleChangeLoading(true);
    try {
      await userService.updateRole(roleChangeTarget.userId, roleChangeTarget.newRole);
      const successMsg = `Peran "${roleChangeTarget.userName}" berhasil diubah menjadi ${roleChangeTarget.newRole}.`;
      toast.success(successMsg);
      setMessage({ text: successMsg, isError: false });
      setRoleChangeTarget(null);
      fetchUsers(currentPage);
    } catch (err) {
      console.error(err);
      const extracted = extractErrorMessage(err);
      const errorMsg = `Gagal memperbarui peran: ${extracted.message}`;
      toast.error(errorMsg);
      setMessage({ text: errorMsg, isError: true });
    } finally {
      setRoleChangeLoading(false);
    }
  };

  const getRoleBadge = (roles: string[]) => {
    const primary = roles[0] || 'staff';
    if (primary === 'superuser') {
      return 'border-slate-800 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-100 dark:text-slate-950';
    }
    if (primary === 'admin') {
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300';
    }
    return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  if (loading && users.length === 0) return <LoadingIndicator message="Memuat direktori pengguna..." />;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Manajemen Pengguna
              </h1>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {users.length} Akun Aktif
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pengelolaan kredensial login, registrasi personel, dan pembagian tingkat wewenang sistem.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            <Plus size={14} />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {errorDetails && <ErrorMessage message={errorDetails.message} traceId={errorDetails.traceId} />}
      {message && (
        <div
          className={`rounded border px-4 py-3 text-xs font-medium ${
            message.isError
              ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Nama & Identitas</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Email Akses</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Tingkat Peran</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Tanggal Dibuat</th>
                <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-[11px]">Aksi Penugasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/80 dark:bg-slate-900">
              {users.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 font-mono text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                          {isCurrent && (
                            <span className="ml-2 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                              Akun Anda
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wide ${getRoleBadge(u.roles)}`}>
                        <ShieldCheck size={11} />
                        {u.roles.join(', ') || 'No Role'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                      {new Date(u.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <select
                        value={u.roles[0] || 'staff'}
                        onChange={(e) => initiateRoleChange(u.id, e.target.value, u.name)}
                        disabled={isCurrent}
                        title={isCurrent ? 'Anda tidak dapat mengubah peran akun Anda sendiri' : 'Ubah wewenang pengguna'}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-2xs outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-slate-600"
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="superuser">Superuser</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Halaman <span className="font-mono font-semibold text-slate-900 dark:text-white">{currentPage}</span> dari <span className="font-mono font-semibold text-slate-900 dark:text-white">{lastPage}</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronLeft size={13} /> Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
              disabled={currentPage === lastPage}
              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Berikutnya <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah Pengguna */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrasi Pengguna Baru"
        description="Lengkapi kredensial dan hak akses untuk personil baru."
        maxWidthClassName="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Peran Utama <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-600"
            >
              <option value="staff">Staff (Operasional Standar)</option>
              <option value="admin">Admin (Manajemen Data & Aset)</option>
              <option value="superuser">Superuser (Otoritas Penuh)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              {submitLoading ? 'Memproses...' : <><UserCheck size={14} /> Daftarkan Pengguna</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Perubahan Peran Pengguna */}
      <ConfirmDialog
        isOpen={roleChangeTarget !== null}
        title="Ubah Wewenang Pengguna"
        message={`Apakah Anda yakin ingin mengubah tingkat otoritas untuk "${roleChangeTarget?.userName}" menjadi "${roleChangeTarget?.newRole?.toUpperCase()}"?\n\nPerubahan ini akan langsung mempengaruhi hak akses menu dan aksi pengguna di sistem.`}
        confirmLabel="Ubah Wewenang"
        cancelLabel="Batal"
        variant="warning"
        isLoading={roleChangeLoading}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => setRoleChangeTarget(null)}
      />
    </div>
  );
};

export default UserPage;
