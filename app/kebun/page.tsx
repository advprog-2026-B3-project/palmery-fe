"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getPlantations,
  deletePlantation,
  type PlantationSummary,
  type ApiError,
} from "@/lib/kebun-api";

export default function KebunListPage() {
  const [plantations, setPlantations] = useState<PlantationSummary[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPlantations() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlantations(
        searchName || undefined,
        searchCode || undefined
      );
      setPlantations(data);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.error ?? "Gagal memuat data kebun");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlantations();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kebun "${name}"?`)) return;
    try {
      await deletePlantation(id);
      setPlantations((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const apiErr = err as ApiError;
      alert(apiErr.error ?? "Gagal menghapus kebun");
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadPlantations();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Kebun</h1>
        <Link
          href="/kebun/create"
          className="inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          style={{ backgroundColor: "#4a5c3a" }}
        >
          + Tambah Kebun
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">Cari Nama Kebun</label>
          <input
            type="text"
            placeholder="Ketik nama kebun.."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="mt-1 w-48 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Cari Kode Kebun</label>
          <input
            type="text"
            placeholder="Ketik kode.."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="mt-1 w-48 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          style={{ backgroundColor: "#4a5c3a" }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Cari
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500">
              <th className="px-4 py-3">Nama Kebun</th>
              <th className="px-4 py-3">Kode Kebun</th>
              <th className="px-4 py-3">Luas (Ha)</th>
              <th className="px-4 py-3">Mandor</th>
              <th className="px-4 py-3">Jumlah Supir</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            )}
            {!loading && plantations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada data kebun ditemukan.
                </td>
              </tr>
            )}
            {!loading &&
              plantations.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.code}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{p.areaHa} Ha</td>
                  <td className="px-4 py-3 text-gray-600">-</td>
                  <td className="px-4 py-3 text-gray-600">-</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href={`/kebun/${p.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-100 text-green-700 hover:bg-green-200"
                        title="Detail"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/kebun/${p.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                        title="Hapus"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && plantations.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
            <span>Showing 1-{plantations.length} of {plantations.length} results</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md text-white" style={{ backgroundColor: "#4a5c3a" }}>
              1
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
