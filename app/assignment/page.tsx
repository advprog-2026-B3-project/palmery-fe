"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  assignWorkerToMandor,
  getAllWorkerAssignments,
  getUsersByRole,
  unassignWorker,
  type UserSummary,
  type WorkerAssignment,
} from "@/lib/api";

type Toast = { kind: "success" | "error"; message: string };

export default function WorkerAssignmentPage() {
  const [workers, setWorkers] = useState<UserSummary[]>([]);
  const [mandors, setMandors] = useState<UserSummary[]>([]);
  const [assignments, setAssignments] = useState<WorkerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedMandor, setSelectedMandor] = useState("");

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [workerData, mandorData, assignmentData] = await Promise.all([
        getUsersByRole("WORKER"),
        getUsersByRole("SUPERVISOR"),
        getAllWorkerAssignments(),
      ]);
      setWorkers(workerData);
      setMandors(mandorData);
      setAssignments(assignmentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  const userById = useMemo(() => {
    const map = new Map<string, UserSummary>();
    [...workers, ...mandors].forEach((u) => map.set(u.id, u));
    return map;
  }, [workers, mandors]);

  const assignmentByWorkerId = useMemo(() => {
    const map = new Map<string, WorkerAssignment>();
    assignments.forEach((a) => map.set(a.workerId, a));
    return map;
  }, [assignments]);

  function showToast(kind: Toast["kind"], message: string) {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWorker || !selectedMandor) {
      showToast("error", "Pilih Buruh dan Mandor terlebih dahulu");
      return;
    }
    setSaving(true);
    try {
      await assignWorkerToMandor(selectedWorker, selectedMandor);
      const isReassign = assignmentByWorkerId.has(selectedWorker);
      showToast("success", isReassign ? "Buruh berhasil dipindahkan ke Mandor baru" : "Buruh berhasil ditempatkan");
      setSelectedWorker("");
      setSelectedMandor("");
      await loadAll();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Gagal menugaskan Buruh");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnassign(workerId: string) {
    if (!confirm("Copot Buruh ini dari Mandor saat ini?")) return;
    try {
      await unassignWorker(workerId);
      showToast("success", "Buruh berhasil dicopot");
      await loadAll();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Gagal mencopot Buruh");
    }
  }

  function formatUser(u?: UserSummary | null, fallbackId?: string) {
    if (u) return `${u.nama} (${u.email})`;
    return fallbackId ? `#${fallbackId.slice(0, 8)}` : "-";
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold">Penempatan Buruh ke Mandor</h1>
        <p className="text-[var(--color-text-muted)] mt-1 mb-6">
          Tetapkan setiap Buruh kepada satu Mandor. Memilih Buruh yang sudah punya Mandor akan memindahkan Buruh tersebut ke Mandor baru.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>
        )}

        {toast && (
          <div
            className={`rounded-xl p-4 text-sm mb-4 ${
              toast.kind === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleAssign}
          className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5">Buruh</label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              required
            >
              <option value="">Pilih Buruh...</option>
              {workers.map((w) => {
                const current = assignmentByWorkerId.get(w.id);
                const suffix = current ? " — sudah di mandor lain" : "";
                return (
                  <option key={w.id} value={w.id}>
                    {w.nama} ({w.email}){suffix}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Mandor Tujuan</label>
            <select
              value={selectedMandor}
              onChange={(e) => setSelectedMandor(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              required
            >
              <option value="">Pilih Mandor...</option>
              {mandors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex justify-center items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Tempatkan / Pindahkan"}
            </button>
          </div>
        </form>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">Total Buruh</p>
            <p className="text-3xl font-bold mt-1">{workers.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">Total Mandor</p>
            <p className="text-3xl font-bold mt-1">{mandors.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">Buruh Terplot</p>
            <p className="text-3xl font-bold mt-1">
              {assignments.length}
              <span className="text-sm font-normal text-[var(--color-text-muted)]"> / {workers.length}</span>
            </p>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold">Daftar Penempatan</h2>
            <button
              onClick={loadAll}
              className="text-sm text-[var(--color-primary)] font-medium hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[var(--color-text-muted)]">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-text-muted)]">
              Belum ada Buruh yang ditempatkan ke Mandor.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Buruh</th>
                  <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Mandor</th>
                  <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Sejak</th>
                  <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Diperbarui</th>
                  <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.workerId} className="border-b border-[var(--color-border-light)] last:border-0">
                    <td className="px-5 py-3">{formatUser(userById.get(a.workerId), a.workerId)}</td>
                    <td className="px-5 py-3">{formatUser(userById.get(a.mandorId), a.mandorId)}</td>
                    <td className="px-5 py-3 text-[var(--color-text-muted)]">
                      {a.assignedAt ? new Date(a.assignedAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-text-muted)]">
                      {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-5 py-3 flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedWorker(a.workerId);
                          setSelectedMandor("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        Pindahkan
                      </button>
                      <button
                        onClick={() => handleUnassign(a.workerId)}
                        className="text-red-600 hover:underline"
                      >
                        Copot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
