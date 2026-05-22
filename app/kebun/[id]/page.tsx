"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/useAuth";
import {
  assignMandorToPlantation,
  assignSupirToPlantation,
  getPlantationById,
  getPlantations,
  getUsersByIds,
  getUsersByRole,
  transferMandorBetweenPlantations,
  transferSupirBetweenPlantations,
  unassignMandorFromPlantation,
  unassignSupirFromPlantation,
  type PlantationDetail,
  type PlantationSummary,
  type UserSummary,
} from "@/lib/api";

export default function KebunDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAdmin } = useAuth();

  const [plantation, setPlantation] = useState<PlantationDetail | null>(null);
  const [otherPlantations, setOtherPlantations] = useState<PlantationSummary[]>([]);
  const [mandors, setMandors] = useState<UserSummary[]>([]);
  const [supirs, setSupirs] = useState<UserSummary[]>([]);
  const [mandorOptions, setMandorOptions] = useState<UserSummary[]>([]);
  const [supirOptions, setSupirOptions] = useState<UserSummary[]>([]);
  const [selectedMandor, setSelectedMandor] = useState("");
  const [selectedSupir, setSelectedSupir] = useState("");
  const [transferTarget, setTransferTarget] = useState<{ personnelId: string; role: "MANDOR" | "SUPIR" } | null>(null);
  const [transferToPlantation, setTransferToPlantation] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPlantation();
  }, [id, isAdmin]);

  async function loadPlantation() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlantationById(id);
      setPlantation(data);

      const assignedIds = [
        ...(data.assignedMandorIds ?? []),
        ...(data.assignedSupirIds ?? []),
      ];
      const assignedUsers = assignedIds.length > 0 ? await getUsersByIds(assignedIds) : [];
      setMandors(assignedUsers.filter((user) => data.assignedMandorIds?.includes(user.id)));
      setSupirs(assignedUsers.filter((user) => data.assignedSupirIds?.includes(user.id)));

      if (isAdmin) {
        const [availableMandors, availableSupirs, allPlantations] = await Promise.all([
          getUsersByRole("SUPERVISOR"),
          getUsersByRole("DRIVER"),
          getPlantations(),
        ]);
        setMandorOptions(availableMandors);
        setSupirOptions(availableSupirs);
        setOtherPlantations(allPlantations.filter((p) => p.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plantation");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignment(action: () => Promise<void>, successMessage: string) {
    setSavingAssignment(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(successMessage);
      await loadPlantation();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan assignment");
    } finally {
      setSavingAssignment(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["ADMIN", "MANDOR"]}>
        <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!plantation) {
    return (
      <DashboardLayout allowedRoles={["ADMIN", "MANDOR"]}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error || "Plantation not found"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN", "MANDOR"]}>
      <div className="max-w-5xl">
        {/* Breadcrumb */}
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/kebun" className="hover:text-[var(--color-primary)]">Kebun</Link>
          <span className="mx-2">›</span>
          <span>{plantation.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{plantation.name}</h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                plantation.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {plantation.isActive ? "Active Production" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {plantation.code} • Luas: {plantation.areaHa} Hektar
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Blok
            </button>
            <Link
              href="/panen/tambah"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Input Panen
            </Link>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--color-text-muted)]">Luas Terdaftar</p>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              </svg>
            </div>
            <p className="text-3xl font-bold">{plantation.areaHa} <span className="text-sm font-normal text-[var(--color-text-muted)]">Ha</span></p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Nilai dari backend manage</p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--color-text-muted)]">Supir Ditugaskan</p>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/>
              </svg>
            </div>
            <p className="text-3xl font-bold">{supirs.length}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Dipakai filter supir pengiriman</p>
          </div>

          {/* Mandor Card */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Mandor Terpilih</p>
            {mandors.length > 0 ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-sm font-bold text-[var(--color-primary)]">
                    {mandors[0].nama?.charAt(0) ?? "M"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{mandors[0].nama}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">ID: {mandors[0].id.slice(0, 12)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-full border border-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-accent)]/10">
                    Hubungi
                  </button>
                  <button className="flex-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-border-light)]">
                    Pesan
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Belum ada mandor ditugaskan</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Assignment Kebun</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Mandor dan supir yang terikat di kebun ini dipakai backend untuk filter panen dan pengiriman.
              </p>
            </div>
            <button
              onClick={loadPlantation}
              className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-border-light)]"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h3 className="text-sm font-semibold mb-2">Mandor Assigned</h3>
              <div className="space-y-2">
                {mandors.length > 0 ? mandors.map((mandor) => (
                  <div key={mandor.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border-light)] px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{mandor.nama}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{mandor.email}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTransferTarget({ personnelId: mandor.id, role: "MANDOR" });
                            setTransferToPlantation("");
                          }}
                          disabled={savingAssignment}
                          className="text-xs rounded-full border border-[var(--color-border)] px-3 py-1 hover:bg-[var(--color-border-light)] disabled:opacity-50"
                        >
                          Pindahkan
                        </button>
                        <button
                          onClick={() => handleAssignment(
                            () => unassignMandorFromPlantation(plantation.id, mandor.id),
                            "Mandor berhasil dilepas dari kebun.",
                          )}
                          disabled={savingAssignment}
                          className="text-xs rounded-full border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Lepas
                        </button>
                      </div>
                    )}
                  </div>
                )) : (
                  <p className="text-sm text-[var(--color-text-muted)]">Belum ada mandor ditugaskan.</p>
                )}
              </div>

              {isAdmin && (
                <div className="mt-3 flex gap-2">
                  <select
                    value={selectedMandor}
                    onChange={(e) => setSelectedMandor(e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Pilih mandor...</option>
                    {mandorOptions.map((mandor) => (
                      <option key={mandor.id} value={mandor.id}>
                        {mandor.nama} ({mandor.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (!selectedMandor) {
                        setError("Pilih mandor terlebih dahulu.");
                        return;
                      }
                      handleAssignment(
                        () => assignMandorToPlantation(plantation.id, selectedMandor),
                        "Mandor berhasil ditugaskan ke kebun.",
                      );
                    }}
                    disabled={savingAssignment}
                    className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Supir Assigned</h3>
              <div className="space-y-2">
                {supirs.length > 0 ? supirs.map((supir) => (
                  <div key={supir.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border-light)] px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{supir.nama}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{supir.email}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTransferTarget({ personnelId: supir.id, role: "SUPIR" });
                            setTransferToPlantation("");
                          }}
                          disabled={savingAssignment}
                          className="text-xs rounded-full border border-[var(--color-border)] px-3 py-1 hover:bg-[var(--color-border-light)] disabled:opacity-50"
                        >
                          Pindahkan
                        </button>
                        <button
                          onClick={() => handleAssignment(
                            () => unassignSupirFromPlantation(plantation.id, supir.id),
                            "Supir berhasil dilepas dari kebun.",
                          )}
                          disabled={savingAssignment}
                          className="text-xs rounded-full border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Lepas
                        </button>
                      </div>
                    )}
                  </div>
                )) : (
                  <p className="text-sm text-[var(--color-text-muted)]">Belum ada supir ditugaskan.</p>
                )}
              </div>

              {isAdmin && (
                <div className="mt-3 flex gap-2">
                  <select
                    value={selectedSupir}
                    onChange={(e) => setSelectedSupir(e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Pilih supir...</option>
                    {supirOptions.map((supir) => (
                      <option key={supir.id} value={supir.id}>
                        {supir.nama} ({supir.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (!selectedSupir) {
                        setError("Pilih supir terlebih dahulu.");
                        return;
                      }
                      handleAssignment(
                        () => assignSupirToPlantation(plantation.id, selectedSupir),
                        "Supir berhasil ditugaskan ke kebun.",
                      );
                    }}
                    disabled={savingAssignment}
                    className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-[var(--color-bg-dark)] rounded-xl h-48 md:h-64 mb-6 flex items-end p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <p className="relative text-white text-sm">
            Koordinat: {plantation.coordTlLat?.toFixed(4)}° N, {plantation.coordTlLon?.toFixed(4)}° E
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-bold mb-3">Koordinat Batas dari Backend</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg border border-[var(--color-border-light)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">Top Left</p>
              <p>{plantation.coordTlLat}, {plantation.coordTlLon}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border-light)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">Top Right</p>
              <p>{plantation.coordTrLat}, {plantation.coordTrLon}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border-light)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">Bottom Right</p>
              <p>{plantation.coordBrLat}, {plantation.coordBrLon}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border-light)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">Bottom Left</p>
              <p>{plantation.coordBlLat}, {plantation.coordBlLon}</p>
            </div>
          </div>
        </div>

        {transferTarget && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setTransferTarget(null)}
          >
            <div
              className="bg-white rounded-xl border border-[var(--color-border)] p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2">
                Pindahkan {transferTarget.role === "MANDOR" ? "Mandor" : "Supir"} ke Kebun Lain
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Operasi ini bersifat atomik. Personel akan dilepas dari kebun ini dan langsung ditugaskan ke kebun tujuan.
              </p>

              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Kebun Tujuan</label>
              <select
                value={transferToPlantation}
                onChange={(e) => setTransferToPlantation(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white mb-4"
              >
                <option value="">Pilih kebun...</option>
                {otherPlantations.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setTransferTarget(null)}
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)]"
                >
                  Batal
                </button>
                <button
                  disabled={!transferToPlantation || savingAssignment}
                  onClick={() => {
                    if (!transferToPlantation) return;
                    const target = transferTarget;
                    const action = target.role === "MANDOR"
                      ? () => transferMandorBetweenPlantations(plantation.id, transferToPlantation, target.personnelId)
                      : () => transferSupirBetweenPlantations(plantation.id, transferToPlantation, target.personnelId);
                    handleAssignment(
                      action,
                      `${target.role === "MANDOR" ? "Mandor" : "Supir"} berhasil dipindahkan ke kebun tujuan.`,
                    ).finally(() => setTransferTarget(null));
                  }}
                  className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Pindahkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
