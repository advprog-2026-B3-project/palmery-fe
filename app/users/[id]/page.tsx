"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getUserById, type UserDetail } from "@/lib/api";

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserById(id);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="max-w-3xl">
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/users" className="hover:text-[var(--color-primary)]">Pengguna</Link>
          <span className="mx-2">›</span>
          <span>Detail</span>
        </div>

        {loading && <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>}

        {user && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-2xl font-bold text-[var(--color-primary)]">
                {(user.nama ?? "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold truncate">{user.nama}</h1>
                <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-border-light)]">
                {user.role}
              </span>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Field label="ID Pengguna" value={user.id} mono />
              <Field label="Status" value={user.active ? "Aktif" : "Tidak Aktif"} />
              <Field label="Email" value={user.email} />
              <Field label="Role" value={user.role} />
              {user.role === "SUPERVISOR" && (
                <Field
                  label="Nomor Sertifikasi Mandor"
                  value={user.supervisorCertNumber ?? "—"}
                />
              )}
              <Field
                label="Dibuat"
                value={user.createdAt ? new Date(user.createdAt).toLocaleString("id-ID") : "—"}
              />
              <Field
                label="Diperbarui"
                value={user.updatedAt ? new Date(user.updatedAt).toLocaleString("id-ID") : "—"}
              />
            </dl>

            <div className="mt-6 flex gap-3">
              {user.role === "WORKER" && (
                <Link
                  href={`/panen/buruh/${user.id}`}
                  className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
                >
                  Lihat Riwayat Panen
                </Link>
              )}
              <Link
                href="/users"
                className="rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-medium hover:bg-[var(--color-border-light)]"
              >
                Kembali
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{label}</dt>
      <dd className={`mt-1 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
