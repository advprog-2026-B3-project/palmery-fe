"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  assignSupirToPlantation,
  getPlantations,
  getPlantationById,
  getUsersByRole,
  transferSupirBetweenPlantations,
  unassignSupirFromPlantation,
  type PlantationSummary,
  type UserSummary,
} from "@/lib/api";

type DriverPlacement = {
  driverId: string;
  plantationId: string;
};

type Toast = { kind: "success" | "error"; message: string };

export default function DriverAssignmentPage() {
  const [drivers, setDrivers] = useState<UserSummary[]>([]);
  const [plantations, setPlantations] = useState<PlantationSummary[]>([]);
  const [placements, setPlacements] = useState<DriverPlacement[]>([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedPlantation, setSelectedPlantation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [driverData, plantationData] = await Promise.all([
        getUsersByRole("DRIVER"),
        getPlantations(),
      ]);
      setDrivers(driverData);
      setPlantations(plantationData);

      const plantationDetails = await Promise.all(
        plantationData.map((plantation) => getPlantationById(plantation.id)),
      );
      setPlacements(
        plantationDetails.flatMap((plantation) =>
          (plantation.assignedSupirIds ?? []).map((driverId) => ({
            driverId,
            plantationId: plantation.id,
          })),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data penempatan supir");
    } finally {
      setLoading(false);
    }
  }

  const driverById = useMemo(() => {
    const map = new Map<string, UserSummary>();
    drivers.forEach((driver) => map.set(driver.id, driver));
    return map;
  }, [drivers]);

  const plantationById = useMemo(() => {
    const map = new Map<string, PlantationSummary>();
    plantations.forEach((plantation) => map.set(plantation.id, plantation));
    return map;
  }, [plantations]);

  const placementByDriverId = useMemo(() => {
    const map = new Map<string, DriverPlacement>();
    placements.forEach((placement) => map.set(placement.driverId, placement));
    return map;
  }, [placements]);

  function showToast(kind: Toast["kind"], message: string) {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAssign(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedDriver || !selectedPlantation) {
      showToast("error", "Pilih Supir dan Kebun terlebih dahulu");
      return;
    }

    setSaving(true);
    try {
      const current = placementByDriverId.get(selectedDriver);
      if (current && current.plantationId !== selectedPlantation) {
        await transferSupirBetweenPlantations(current.plantationId, selectedPlantation, selectedDriver);
        showToast("success", "Supir berhasil dipindahkan ke kebun tujuan");
      } else if (!current) {
        await assignSupirToPlantation(selectedPlantation, selectedDriver);
        showToast("success", "Supir berhasil ditempatkan ke kebun");
      } else {
        showToast("success", "Supir sudah berada di kebun tersebut");
      }

      setSelectedDriver("");
      setSelectedPlantation("");
      await loadAll();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Gagal menempatkan Supir");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnassign(placement: DriverPlacement) {
    if (!confirm("Copot Supir ini dari Kebun saat ini?")) return;
    try {
      await unassignSupirFromPlantation(placement.plantationId, placement.driverId);
      showToast("success", "Supir berhasil dicopot dari kebun");
      await loadAll();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Gagal mencopot Supir");
    }
  }

  function formatDriver(driverId: string) {
    const driver = driverById.get(driverId);
    return driver ? `${driver.nama} (${driver.email})` : `#${driverId.slice(0, 8)}`;
  }

  function formatPlantation(plantationId: string) {
    const plantation = plantationById.get(plantationId);
    return plantation ? `${plantation.name} (${plantation.code})` : `#${plantationId.slice(0, 8)}`;
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold">Penempatan Supir ke Kebun</h1>
        <p className="text-[var(--color-text-muted)] mt-1 mb-6">
          Tetapkan Supir ke Kebun agar Mandor hanya dapat memilih Supir dari Kebun yang sama.
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

        <form
          onSubmit={handleAssign}
          className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5">Supir</label>
            <select
              value={selectedDriver}
              onChange={(event) => setSelectedDriver(event.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              required
            >
              <option value="">Pilih Supir...</option>
              {drivers.map((driver) => {
                const current = placementByDriverId.get(driver.id);
                const suffix = current ? ` - ${formatPlantation(current.plantationId)}` : "";
                return (
                  <option key={driver.id} value={driver.id}>
                    {driver.nama} ({driver.email}){suffix}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Kebun Tujuan</label>
            <select
              value={selectedPlantation}
              onChange={(event) => setSelectedPlantation(event.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              required
            >
              <option value="">Pilih Kebun...</option>
              {plantations.map((plantation) => (
                <option key={plantation.id} value={plantation.id}>
                  {plantation.name} ({plantation.code})
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">Total Supir</p>
            <p className="text-3xl font-bold mt-1">{drivers.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">Total Kebun</p>
            <p className="text-3xl font-bold mt-1">{plantations.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">Supir Terplot</p>
            <p className="text-3xl font-bold mt-1">
              {placements.length}
              <span className="text-sm font-normal text-[var(--color-text-muted)]"> / {drivers.length}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold">Daftar Penempatan Supir</h2>
            <button onClick={loadAll} className="text-sm text-[var(--color-primary)] font-medium hover:underline">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[var(--color-text-muted)]">Loading...</div>
          ) : placements.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-text-muted)]">
              Belum ada Supir yang ditempatkan ke Kebun.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Supir</th>
                  <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Kebun</th>
                  <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((placement) => (
                  <tr key={placement.driverId} className="border-b border-[var(--color-border-light)] last:border-0">
                    <td className="px-5 py-3">{formatDriver(placement.driverId)}</td>
                    <td className="px-5 py-3">{formatPlantation(placement.plantationId)}</td>
                    <td className="px-5 py-3 flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedDriver(placement.driverId);
                          setSelectedPlantation("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        Pindahkan
                      </button>
                      <button onClick={() => handleUnassign(placement)} className="text-red-600 hover:underline">
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
