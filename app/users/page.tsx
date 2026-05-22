"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/useAuth";
import { deleteUser, searchUsers, type UserSummary } from "@/lib/api";

const ROLE_OPTIONS = [
  { value: "", label: "Semua Role" },
  { value: "ADMIN", label: "Admin Utama" },
  { value: "SUPERVISOR", label: "Mandor" },
  { value: "WORKER", label: "Buruh" },
  { value: "DRIVER", label: "Supir" },
];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await searchUsers({
        name: filterName || undefined,
        email: filterEmail || undefined,
        role: filterRole || undefined,
      });
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat user");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(target: UserSummary) {
    if (currentUser?.sub === target.id) {
      setError("Admin tidak dapat menghapus akunnya sendiri");
      return;
    }
    if (!confirm(`Hapus user "${target.nama}" (${target.email})?`)) return;
    try {
      await deleteUser(target.id);
      setToast(`User ${target.nama} berhasil dihapus`);
      setTimeout(() => setToast(null), 3000);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus user");
    }
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold">Manajemen Pengguna</h1>
        <p className="text-[var(--color-text-muted)] mt-1 mb-6">
          Cari, lihat detail, dan hapus akun pengguna. Admin tidak dapat menghapus akunnya sendiri.
        </p>

        {toast && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 mb-4">
            {toast}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Cari Nama</label>
              <input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Nama..."
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Cari Email</label>
              <input
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="Email..."
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={load}
                className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
              >
                Terapkan
              </button>
              <button
                onClick={() => {
                  setFilterName("");
                  setFilterEmail("");
                  setFilterRole("");
                  setTimeout(load, 0);
                }}
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>}

        {!loading && users.length === 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center text-[var(--color-text-muted)]">
            Tidak ada user yang cocok dengan filter.
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = currentUser?.sub === u.id;
                  return (
                    <tr key={u.id} className="border-b border-[var(--color-border-light)] last:border-0">
                      <td className="px-4 py-3 font-medium">
                        {u.nama}
                        {isSelf && (
                          <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            Anda
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-border-light)] text-[var(--color-text)]">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-3">
                        <Link
                          href={`/users/${u.id}`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          Detail
                        </Link>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={isSelf}
                          className="text-red-600 hover:underline disabled:text-[var(--color-text-muted)] disabled:no-underline disabled:cursor-not-allowed"
                          title={isSelf ? "Tidak dapat menghapus akun sendiri" : "Hapus user"}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
