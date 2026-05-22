"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/useAuth";
import {
  getPlantations,
  getUsersByIds,
  getWorkerAssignment,
  hasSubmittedHarvestToday,
  submitHarvest,
  uploadHarvestPhoto,
  type PlantationSummary,
  type UserSummary,
} from "@/lib/api";

export default function TambahPanenPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optionWarning, setOptionWarning] = useState<string | null>(null);
  const [plantations, setPlantations] = useState<PlantationSummary[]>([]);
  const [assignedMandor, setAssignedMandor] = useState<UserSummary | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [alreadySubmittedToday, setAlreadySubmittedToday] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    plantationId: "",
    mandorId: "",
    harvestDate: today,
    kgHarvested: "",
    notes: "",
  });

  useEffect(() => {
    if (user?.sub) {
      loadOptions(user.sub);
    }
  }, [user?.sub]);

  async function loadOptions(workerId: string) {
    setLoadingOptions(true);
    setOptionWarning(null);
    try {
      const [plantationData, assignment, submittedToday] = await Promise.all([
        getPlantations(),
        getWorkerAssignment(workerId).catch(() => null),
        hasSubmittedHarvestToday().catch(() => false),
      ]);
      setPlantations(plantationData);
      setAlreadySubmittedToday(submittedToday);

      if (assignment) {
        setForm((prev) => ({ ...prev, mandorId: assignment.mandorId }));
        const [mandorProfile] = await getUsersByIds([assignment.mandorId]).catch(() => []);
        setAssignedMandor(mandorProfile ?? null);
      } else {
        setOptionWarning(
          "Anda belum ditempatkan ke Mandor manapun. Hubungi Admin untuk pengaturan penempatan sebelum mencatat hasil panen.",
        );
      }
    } catch (err) {
      setOptionWarning(
        err instanceof Error
          ? `Data dropdown tidak bisa dimuat: ${err.message}.`
          : "Data dropdown tidak bisa dimuat otomatis.",
      );
    } finally {
      setLoadingOptions(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotos(Array.from(e.target.files ?? []));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const uploadedPhotos = photos.length > 0
        ? await Promise.all(photos.map((file) => uploadHarvestPhoto(file)))
        : [];

      await submitHarvest({
        plantationId: form.plantationId,
        mandorId: form.mandorId,
        harvestDate: form.harvestDate,
        kgHarvested: parseFloat(form.kgHarvested) || 0,
        notes: form.notes,
        photos: uploadedPhotos,
      });
      router.push("/panen");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah hasil panen");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm({
      plantationId: "",
      mandorId: "",
      harvestDate: today,
      kgHarvested: "",
      notes: "",
    });
    setPhotos([]);
    setError(null);
  }

  return (
    <DashboardLayout allowedRoles={["BURUH"]}>
      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/panen" className="hover:text-[var(--color-primary)]">Panen</Link>
          <span className="mx-2">›</span>
          <span>Tambah Hasil</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Tambah Hasil Panen</h1>
        <p className="text-[var(--color-text-muted)] mb-4">
          Catat data hasil panen harian dari perkebunan secara akurat untuk memantau produktivitas dan logistik pengiriman.
        </p>

        {alreadySubmittedToday && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">Hasil panen hari ini sudah tercatat</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Anda hanya bisa mencatat hasil panen satu kali per hari. Silakan tunggu hari berikutnya untuk pencatatan baru.
                </p>
                <Link
                  href="/panen"
                  className="inline-flex mt-3 rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
                >
                  Lihat Riwayat Panen
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-6">
          <p className="font-medium mb-1">Info</p>
          <p>
            ID Buruh otomatis diambil dari akun login Anda, dan Mandor otomatis sesuai penempatan oleh Admin.
            Anda hanya perlu memilih Kebun, mengisi berat panen, catatan, dan foto bukti.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {optionWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-4">
            {optionWarning}
          </div>
        )}

        <form onSubmit={handleSubmit} className={alreadySubmittedToday ? "pointer-events-none opacity-50" : ""}>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Kebun</label>
                {plantations.length > 0 ? (
                  <select
                    name="plantationId"
                    value={form.plantationId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] bg-white"
                  >
                    <option value="">{loadingOptions ? "Memuat kebun..." : "Pilih kebun..."}</option>
                    {plantations.map((plantation) => (
                      <option key={plantation.id} value={plantation.id}>
                        {plantation.name} ({plantation.code})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="plantationId"
                    value={form.plantationId}
                    onChange={handleChange}
                    placeholder="UUID kebun"
                    required
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Mandor Penanggung Jawab</label>
                <input
                  value={
                    assignedMandor
                      ? `${assignedMandor.nama} (${assignedMandor.email})`
                      : form.mandorId
                        ? form.mandorId
                        : ""
                  }
                  disabled
                  placeholder={loadingOptions ? "Memuat..." : "Belum ada Mandor"}
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm bg-[var(--color-border-light)] text-[var(--color-text-muted)]"
                />
                <input type="hidden" name="mandorId" value={form.mandorId} />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Mandor otomatis sesuai penempatan oleh Admin.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Pilih Tanggal</label>
                <input
                  type="date"
                  name="harvestDate"
                  value={form.harvestDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Default ke tanggal hari ini.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Foto Bukti</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  required
                  onChange={handlePhotoChange}
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-accent)]/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--color-primary)]"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {photos.length > 0
                    ? `${photos.length} foto dipilih.`
                    : "Wajib unggah minimal satu foto sebagai bukti lapangan."}
                </p>
              </div>
            </div>

            {/* Total Kg */}
            <div className="mt-5">
              <label className="block text-sm font-medium mb-1.5">Total Kg</label>
              <div className="relative">
                <input
                  type="number"
                  name="kgHarvested"
                  value={form.kgHarvested}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)] font-medium">KG</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Masukkan berat bersih dalam satuan Kilogram (Kg).</p>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium mb-1.5">Catatan</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Contoh: kondisi buah matang merata, akses blok aman..."
                required
                className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Wajib diisi untuk dokumentasi lapangan.</p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={loading || alreadySubmittedToday}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {loading ? "Menyimpan..." : "Tambah Hasil"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-border-light)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Reset Form
              </button>
            </div>
          </div>
        </form>

        {/* Backend-backed context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                </svg>
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">Kebun Tersedia</span>
            </div>
            <p className="text-2xl font-bold">{plantations.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">Mandor Anda</span>
            </div>
            <p className="text-base font-bold truncate">{assignedMandor?.nama ?? "Belum ditempatkan"}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{assignedMandor?.email ?? "Hubungi Admin"}</p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">Foto Dipilih</span>
            </div>
            <p className="text-lg font-bold">{photos.length} file</p>
            <p className="text-xs text-[var(--color-text-muted)]">Akan diupload ke manage saat submit</p>
          </div>
        </div>

        {/* Banner */}
        <div className="rounded-2xl bg-[var(--color-bg-dark)] h-48 flex items-center justify-between p-6 relative overflow-hidden">
          <p className="relative text-white text-lg font-medium z-10 max-w-md">
            Optimalisasi Hasil Alam melalui Presisi Data.
          </p>
          <img src="/palmery.svg" alt="Palmery" className="relative z-10 h-32 opacity-90" />
        </div>
      </div>
    </DashboardLayout>
  );
}
