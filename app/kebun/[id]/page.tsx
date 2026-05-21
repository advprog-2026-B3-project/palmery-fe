"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getPlantationById,
  deletePlantation,
  assignMandor,
  unassignMandor,
  assignSupir,
  unassignSupir,
  type PlantationDetail,
  type ApiError,
} from "@/lib/kebun-api";

const COORD_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444"];
const COORD_LABELS = [
  "Titik 1 (Barat Laut)",
  "Titik 2 (Timur Laut)",
  "Titik 3 (Timur Selatan)",
  "Titik 4 (Barat Selatan)",
];

export default function KebunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [plantation, setPlantation] = useState<PlantationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  const [mandorInput, setMandorInput] = useState("");
  const [supirInput, setSupirInput] = useState("");
  const [showMandorForm, setShowMandorForm] = useState(false);
  const [showSupirForm, setShowSupirForm] = useState(false);

  async function loadPlantation() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlantationById(id);
      setPlantation(data);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.error ?? "Gagal memuat data kebun");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlantation();
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Hapus kebun "${plantation?.name}"?`)) return;
    try {
      await deletePlantation(id);
      router.push("/kebun");
    } catch (err) {
      const apiErr = err as ApiError;
      alert(apiErr.error ?? "Gagal menghapus kebun");
    }
  }

  async function handleAssignMandor(e: React.FormEvent) {
    e.preventDefault();
    setAssignError(null);
    if (!mandorInput.trim()) return;
    try {
      await assignMandor(id, mandorInput.trim());
      setMandorInput("");
      setShowMandorForm(false);
      loadPlantation();
    } catch (err) {
      const apiErr = err as ApiError;
      setAssignError(apiErr.error ?? "Gagal assign mandor");
    }
  }

  async function handleUnassignMandor(personnelId: string) {
    setAssignError(null);
    try {
      await unassignMandor(id, personnelId);
      loadPlantation();
    } catch (err) {
      const apiErr = err as ApiError;
      setAssignError(apiErr.error ?? "Gagal unassign mandor");
    }
  }

  async function handleAssignSupir(e: React.FormEvent) {
    e.preventDefault();
    setAssignError(null);
    if (!supirInput.trim()) return;
    try {
      await assignSupir(id, supirInput.trim());
      setSupirInput("");
      setShowSupirForm(false);
      loadPlantation();
    } catch (err) {
      const apiErr = err as ApiError;
      setAssignError(apiErr.error ?? "Gagal assign supir");
    }
  }

  async function handleUnassignSupir(personnelId: string) {
    setAssignError(null);
    try {
      await unassignSupir(id, personnelId);
      loadPlantation();
    } catch (err) {
      const apiErr = err as ApiError;
      setAssignError(apiErr.error ?? "Gagal unassign supir");
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-400">Memuat...</div>;
  }

  if (error || !plantation) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500">{error ?? "Kebun tidak ditemukan"}</p>
        <Link href="/kebun" className="mt-4 text-sm text-green-700 hover:underline">Kembali ke daftar</Link>
      </div>
    );
  }

  const coords = [
    { lat: plantation.coordTlLat, lon: plantation.coordTlLon },
    { lat: plantation.coordTrLat, lon: plantation.coordTrLon },
    { lat: plantation.coordBrLat, lon: plantation.coordBrLon },
    { lat: plantation.coordBlLat, lon: plantation.coordBlLon },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Info Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-gray-900">Informasi Kebun</h2>
            <Link
              href={`/kebun/${id}/edit`}
              className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-400"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500">Nama Kebun</p>
              <p className="text-sm font-semibold text-gray-900">{plantation.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Kode Kebun</p>
              <p className="text-sm font-semibold text-gray-900">{plantation.code}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Luas Area</p>
              <p className="text-sm font-semibold text-gray-900">{plantation.areaHa} Hektar</p>
            </div>
          </div>
        </div>

        {/* Coordinates Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Koordinat Batas Kebun</h2>
          <div className="mt-4 space-y-4">
            {coords.map((coord, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COORD_COLORS[i] }} />
                  <span className="text-sm font-semibold text-gray-800">{COORD_LABELS[i]}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Latitude</p>
                    <p className="text-sm font-medium text-gray-800">{coord.lat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Longitude</p>
                    <p className="text-sm font-medium text-gray-800">{coord.lon}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {assignError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {assignError}
          </div>
        )}

        {/* Mandor Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Mandor Pengawas</h3>
            <button
              onClick={() => setShowMandorForm(!showMandorForm)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              style={{ backgroundColor: "#4a5c3a" }}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Assign
            </button>
          </div>

          {showMandorForm && (
            <form onSubmit={handleAssignMandor} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="UUID Mandor"
                value={mandorInput}
                onChange={(e) => setMandorInput(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none"
              />
              <button type="submit" className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500">
                Simpan
              </button>
            </form>
          )}

          <div className="mt-3 space-y-2">
            {plantation.assignedMandorIds && plantation.assignedMandorIds.length > 0 ? (
              plantation.assignedMandorIds.map((mid) => (
                <div key={mid} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                      {mid.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{mid.substring(0, 8)}...</p>
                      <p className="text-xs text-gray-500">Mandor Kebun</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassignMandor(mid)}
                    className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
                  >
                    x Unassign
                  </button>
                </div>
              ))
            ) : (
              <p className="py-2 text-center text-sm text-orange-500">Tidak Ada</p>
            )}
          </div>
        </div>

        {/* Supir Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Daftar Supir Truk</h3>
              <p className="text-xs text-gray-500">
                {plantation.assignedSupirIds?.length ?? 0} Supir terdaftar
              </p>
            </div>
            <button
              onClick={() => setShowSupirForm(!showSupirForm)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              style={{ backgroundColor: "#4a5c3a" }}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Assign
            </button>
          </div>

          {showSupirForm && (
            <form onSubmit={handleAssignSupir} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="UUID Supir"
                value={supirInput}
                onChange={(e) => setSupirInput(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none"
              />
              <button type="submit" className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500">
                Simpan
              </button>
            </form>
          )}

          <div className="mt-3 space-y-2">
            {plantation.assignedSupirIds && plantation.assignedSupirIds.length > 0 ? (
              plantation.assignedSupirIds.map((sid) => (
                <div key={sid} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                      {sid.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{sid.substring(0, 8)}...</p>
                      <p className="text-xs text-gray-500">Supir Aktif</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassignSupir(sid)}
                    className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
                  >
                    x Unassign
                  </button>
                </div>
              ))
            ) : (
              <p className="py-2 text-center text-sm text-gray-400">Belum ada supir ditugaskan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
