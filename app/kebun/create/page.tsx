"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPlantation, type ApiError, type PlantationRequest } from "@/lib/kebun-api";

const COORD_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444"];
const COORD_LABELS = [
  "Titik 1 (Barat Laut)",
  "Titik 2 (Timur Laut)",
  "Titik 3 (Timur Selatan)",
  "Titik 4 (Barat Selatan)",
];

export default function CreateKebunPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const data: PlantationRequest = {
      name: form.get("name") as string,
      code: form.get("code") as string,
      areaHa: parseFloat(form.get("areaHa") as string),
      coordTlLat: parseFloat(form.get("coordTlLat") as string),
      coordTlLon: parseFloat(form.get("coordTlLon") as string),
      coordTrLat: parseFloat(form.get("coordTrLat") as string),
      coordTrLon: parseFloat(form.get("coordTrLon") as string),
      coordBrLat: parseFloat(form.get("coordBrLat") as string),
      coordBrLon: parseFloat(form.get("coordBrLon") as string),
      coordBlLat: parseFloat(form.get("coordBlLat") as string),
      coordBlLon: parseFloat(form.get("coordBlLon") as string),
    };

    try {
      await createPlantation(data);
      router.push("/kebun");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.error ?? "Gagal membuat kebun");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Kebun Baru</h1>
        <p className="mt-1 text-sm text-gray-500">
          Lengkapi informasi kebun untuk menambahkan ke sistem
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Informasi Dasar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Informasi Dasar</h3>
            <div className="mt-3 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">Nama Kebun</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Contoh: Kebun Blok A"
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Kode Kebun</label>
                  <input
                    name="code"
                    type="text"
                    placeholder="Contoh: KBA-001"
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Luas Area (Hektar)</label>
                  <input
                    name="areaHa"
                    type="number"
                    step="0.1"
                    placeholder="25.5"
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Koordinat */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Koordinat Batas Kebun</h3>
              <span className="text-xs text-gray-400">4 titik pembatas wilayah</span>
            </div>
            <div className="mt-3 space-y-4">
              {COORD_LABELS.map((label, i) => {
                const latNames = ["coordTlLat", "coordTrLat", "coordBrLat", "coordBlLat"];
                const lonNames = ["coordTlLon", "coordTrLon", "coordBrLon", "coordBlLon"];
                return (
                  <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COORD_COLORS[i] }} />
                      <span className="text-sm font-semibold text-gray-800">{label}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Latitude</label>
                        <input
                          name={latNames[i]}
                          type="number"
                          step="0.000001"
                          placeholder="-2.548916"
                          required
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Longitude</label>
                        <input
                          name={lonNames[i]}
                          type="number"
                          step="0.000001"
                          placeholder="112.715843"
                          required
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/kebun")}
              className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-md px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: "#4a5c3a" }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {loading ? "Menyimpan..." : "Simpan Kebun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
