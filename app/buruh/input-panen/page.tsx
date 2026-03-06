"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    submitHarvest,
    uploadHarvestPhoto,
    fetchMyHarvests,
    HarvestPhoto,
    Harvest,
} from "@/lib/manage-harvest-api";

const DUMMY_USER_ID = "11111111-1111-1111-1111-111111111111";
const DUMMY_MANDOR_ID = "22222222-2222-2222-2222-222222222222";
const DUMMY_PLANTATION_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

type ToastState = { type: "success" | "error"; message: string } | null;

export default function InputPanenPage() {
    const today = new Date().toISOString().split("T")[0];

    const [date, setDate] = useState(today);
    const [weight, setWeight] = useState("");
    const [notes, setNotes] = useState("");
    const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const [todaySubmitted, setTodaySubmitted] = useState(false);
    const [checkingToday, setCheckingToday] = useState(true);
    const [toast, setToast] = useState<ToastState>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function checkToday() {
            try {
                const harvests: Harvest[] = await fetchMyHarvests(DUMMY_USER_ID, {
                    startDate: today,
                    endDate: today,
                });
                setTodaySubmitted(harvests.length > 0);
            } catch {
                // ignore
            } finally {
                setCheckingToday(false);
            }
        }
        checkToday();
    }, [today]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newPhotos = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setPhotos((prev) => [...prev, ...newPhotos]);
    };

    const removePhoto = (idx: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!weight || Number(weight) <= 0) {
            setToast({ type: "error", message: "Berat sawit harus diisi dan lebih dari 0." });
            return;
        }
        if (notes.length < 20) {
            setToast({ type: "error", message: "Catatan minimal 20 karakter." });
            return;
        }

        setSubmitting(true);
        setToast(null);

        try {
            const photoResults: HarvestPhoto[] = [];
            for (let i = 0; i < photos.length; i++) {
                setUploadingIdx(i);
                const result = await uploadHarvestPhoto(photos[i].file, DUMMY_USER_ID);
                photoResults.push(result);
            }
            setUploadingIdx(null);

            await submitHarvest(
                {
                    plantationId: DUMMY_PLANTATION_ID,
                    mandorId: DUMMY_MANDOR_ID,
                    harvestDate: date,
                    kgHarvested: Number(weight),
                    notes,
                    photos: photoResults,
                },
                DUMMY_USER_ID,
            );

            setToast({ type: "success", message: "Hasil panen berhasil dicatat! Menunggu validasi Mandor." });
            setTodaySubmitted(true);
        } catch (err) {
            setToast({
                type: "error",
                message: err instanceof Error ? err.message : "Terjadi kesalahan.",
            });
        } finally {
            setSubmitting(false);
            setUploadingIdx(null);
        }
    };

    if (checkingToday) {
        return (
            <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
                <p className="text-[#496e00] text-sm font-medium">Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f5] font-sans">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 lg:px-10 justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-[#496e00] w-10 h-10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-white text-xl">P</span>
                    </div>
                    <span className="font-bold text-[#4f5e3e] text-xl">Palmery</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#496e00] text-sm hidden sm:block">Hasil Panen</span>
                    <div className="bg-gray-100 flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
                        <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-blue-800 text-xs">AS</span>
                        </div>
                        <span className="font-medium text-[#4f5e3e] text-sm hidden sm:block">Ahmad S.</span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">

                {/* Back button */}
                <Link
                    href="/buruh"
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-md text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                    ← Kembali
                </Link>

                {/* Warning sudah submit */}
                {todaySubmitted && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                        ⚠️ Kamu sudah mencatat hasil panen hari ini. Input baru hanya bisa dilakukan besok.
                    </div>
                )}

                {/* Form card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="px-6 pt-6 pb-5 border-b border-gray-100">
                        <h1 className="text-2xl font-bold text-gray-900">Catat Hasil Panen</h1>
                        <p className="text-gray-500 text-sm mt-1">Masukkan detail hasil panen sawit hari ini</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

                        {/* Buruh info */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center gap-3">
                            <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                                <span className="font-semibold text-blue-800 text-sm">AS</span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Ahmad Suryanto</p>
                                <p className="text-gray-500 text-xs">Buruh · Kebun Blok A</p>
                            </div>
                        </div>

                        {/* Tanggal & Berat */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Tanggal Panen</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    disabled={todaySubmitted}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#496e00] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Berat Sawit (kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    disabled={todaySubmitted}
                                    placeholder="Contoh: 150"
                                    min={0}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#496e00] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Catatan */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Catatan Hasil Panen</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={todaySubmitted}
                                rows={4}
                                placeholder="Tuliskan catatan hasil panen... (min. 20 karakter)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#496e00] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <div className="flex justify-between">
                                <p className="text-xs text-gray-400">Minimal 20 karakter</p>
                                <p className={`text-xs font-medium ${notes.length >= 20 ? "text-[#496e00]" : "text-gray-400"}`}>
                                    {notes.length} karakter
                                </p>
                            </div>
                        </div>

                        {/* Upload foto */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Foto Hasil Panen</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={todaySubmitted}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={todaySubmitted}
                                className="w-full h-[140px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                                    📷
                                </div>
                                <span className="font-medium text-gray-600 text-sm">Klik untuk upload foto</span>
                                <span className="text-xs text-gray-400">PNG, JPG hingga 5MB per file</span>
                            </button>

                            {photos.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex flex-wrap gap-3">
                                        {photos.map((photo, idx) => (
                                            <div
                                                key={idx}
                                                className="relative rounded-lg overflow-hidden w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] bg-gray-100 border border-gray-200 group"
                                            >
                                                <img
                                                    src={photo.preview}
                                                    alt="preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                {uploadingIdx === idx && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <span className="text-white text-xs font-medium">Uploading...</span>
                                                    </div>
                                                )}
                                                {!todaySubmitted && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removePhoto(idx)}
                                                        className="absolute inset-x-0 bottom-0 bg-red-500 text-white text-xs py-1.5 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400">{photos.length} foto dipilih</p>
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-100" />

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <Link
                                href="/buruh"
                                className="h-11 px-6 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting || todaySubmitted}
                                className="h-11 px-6 bg-[#496e00] rounded-lg text-sm font-semibold text-white hover:bg-[#3b5900] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {submitting ? "Menyimpan..." : "Simpan Hasil Panen"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-4 right-4 max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg">
                    <p className={toast.type === "success" ? "text-green-700 font-medium" : "text-red-600 font-medium"}>
                        {toast.type === "success" ? "✓ " : "✕ "}{toast.message}
                    </p>
                </div>
            )}
        </div>
    );
}