"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    fetchHarvestById,
    validateHarvest,
    Harvest,
} from "@/lib/manage-harvest-api";
import { getSession } from "@/lib/auth";

export default function DetailPanenPage() {
    const params = useParams();
    const router = useRouter();
    const harvestId = params.id as string;

    const [harvest, setHarvest] = useState<Harvest | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPhotoUrl, setShowPhotoUrl] = useState<string | null>(null);
    const [activePhotoIdx, setActivePhotoIdx] = useState(0);

    // Reject modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [validating, setValidating] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        async function loadData() {
            const session = getSession();
            if (!session?.userId) return;

            try {
                const data = await fetchHarvestById(harvestId, session.userId, "MANDOR");
                setHarvest(data);
            } catch (err) {
                console.error("Failed to load harvest:", err);
            } finally {
                setLoading(false);
            }
        }
        if (harvestId) loadData();
    }, [harvestId]);

    const handleApprove = async () => {
        if (!harvest) return;
        if (!confirm("Setujui laporan panen ini?")) return;
        setValidating(true);
        const session = getSession();
        if (!session?.userId) return;

        try {
            const updated = await validateHarvest(harvest.id, {
                status: "APPROVED",
                mandorId: session.userId,
            }, "MANDOR", session.userId);
            setHarvest(updated);
            showToast("success", "Laporan berhasil disetujui.");
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Gagal menyetujui.");
        } finally {
            setValidating(false);
        }
    };

    const handleReject = async () => {
        if (!harvest) return;
        if (!rejectionReason.trim()) {
            showToast("error", "Alasan penolakan wajib diisi.");
            return;
        }
        setValidating(true);
        const session = getSession();
        if (!session?.userId) return;

        try {
            const updated = await validateHarvest(harvest.id, {
                status: "REJECTED",
                mandorId: session.userId,
                rejectionReason,
            }, "MANDOR", session.userId);
            setHarvest(updated);
            setShowRejectModal(false);
            setRejectionReason("");
            showToast("success", "Laporan berhasil ditolak.");
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Gagal menolak.");
        } finally {
            setValidating(false);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const formatDateTime = (dateStr: string) =>
        new Date(dateStr).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
                <p className="text-[#496e00] text-sm font-medium">Memuat data...</p>
            </div>
        );
    }

    if (!harvest) {
        return (
            <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm">Laporan tidak ditemukan.</p>
                <Link href="/mandor/panen" className="text-[#496e00] text-sm font-semibold hover:underline">
                    ← Kembali ke Daftar
                </Link>
            </div>
        );
    }

    const statusInfo = {
        PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", label: "Menunggu Validasi" },
        APPROVED: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", label: "Disetujui" },
        REJECTED: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", label: "Ditolak" },
    }[harvest.status];

    return (
        <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
            `}</style>

            {/* Navbar */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 lg:px-10 justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-[#496e00] w-10 h-10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-white text-xl">P</span>
                    </div>
                    <span className="font-bold text-[#4f5e3e] text-xl">Palmery</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#496e00] text-sm hidden sm:block">Detail Laporan</span>
                    <div className="bg-gray-100 flex items-center gap-2 px-3 py-2 rounded-full">
                        <div className="bg-gray-500 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-white text-xs">
                                {getSession()?.name?.substring(0, 2).toUpperCase() || "MA"}
                            </span>
                        </div>
                        <span className="font-medium text-[#4f5e3e] text-sm hidden sm:block">
                            {getSession()?.name || "Mandor"}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                {/* Breadcrumb & Back */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Link href="/mandor/dashboard" className="hover:text-gray-600">Dashboard</Link>
                    <span>/</span>
                    <Link href="/mandor/panen" className="hover:text-gray-600">Daftar Panen</Link>
                    <span>/</span>
                    <span className="text-gray-600 font-medium">Detail</span>
                </div>

                {/* Status Banner */}
                <div className={`rounded-xl border ${statusInfo.border} ${statusInfo.bg} px-5 py-4 flex items-center justify-between gap-4`}>
                    <div className="flex items-center gap-3">
                        <span className={`text-2xl`}>
                            {harvest.status === "APPROVED" ? "✅" : harvest.status === "REJECTED" ? "❌" : "⏳"}
                        </span>
                        <div>
                            <p className={`font-bold ${statusInfo.text}`}>{statusInfo.label}</p>
                            {harvest.validatedAt && (
                                <p className={`text-xs ${statusInfo.text} opacity-70`}>
                                    Divalidasi: {formatDateTime(harvest.validatedAt)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons — only for PENDING */}
                    {harvest.status === "PENDING" && (
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={handleApprove}
                                disabled={validating}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Setujui
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                disabled={validating}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Tolak
                            </button>
                        </div>
                    )}
                </div>

                {/* Rejection reason if rejected */}
                {harvest.status === "REJECTED" && harvest.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">⚠ Alasan Penolakan</p>
                        <p className="text-sm text-red-700">{harvest.rejectionReason}</p>
                    </div>
                )}

                {/* Detail Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h1 className="text-lg font-bold text-gray-900">Detail Laporan Panen</h1>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {harvest.id}</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Buruh</p>
                            <Link
                                href={`/mandor/buruh/${harvest.workerId}`}
                                className="flex items-center gap-2 group"
                            >
                                <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-blue-800 text-xs">
                                        {harvest.workerId.substring(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 group-hover:text-[#496e00] group-hover:underline">
                                    {harvest.workerId.substring(0, 8)}
                                </span>
                            </Link>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tanggal Panen</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(harvest.harvestDate)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Berat Sawit</p>
                            <p className="text-2xl font-bold text-[#496e00]">{harvest.kgHarvested} kg</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Siap Kirim</p>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${harvest.readyForDelivery ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {harvest.readyForDelivery ? "✓ Siap" : "Belum Siap"}
                            </span>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Catatan Buruh</p>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">{harvest.notes}</p>
                        </div>
                    </div>
                </div>

                {/* Photo Gallery */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">Foto Bukti Panen</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{harvest.photos?.length ?? 0} foto · Klik untuk memperbesar</p>
                    </div>
                    <div className="p-6">
                        {!harvest.photos || harvest.photos.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm italic">
                                Tidak ada foto yang dilampirkan.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Main preview */}
                                <div
                                    className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in border border-gray-200"
                                    onClick={() => setShowPhotoUrl(harvest.photos[activePhotoIdx].url)}
                                >
                                    <img
                                        src={harvest.photos[activePhotoIdx].url}
                                        alt={`foto-${activePhotoIdx}`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                {/* Thumbnails */}
                                {harvest.photos.length > 1 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {harvest.photos.map((p, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActivePhotoIdx(idx)}
                                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activePhotoIdx === idx
                                                    ? "border-[#496e00] scale-105"
                                                    : "border-transparent hover:border-gray-300"
                                                    }`}
                                            >
                                                <img src={p.url} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Tolak Laporan Panen</h3>
                            <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                <p className="text-xs text-red-700 leading-relaxed">
                                    Penolakan akan dikirim ke Buruh.{" "}
                                    <b>Alasan wajib diisi</b> agar Buruh dapat memperbaiki laporan.
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Alasan Penolakan</label>
                                <textarea
                                    autoFocus
                                    rows={4}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Contoh: Berat tidak sesuai foto timbangan..."
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                                />
                                <p className={`text-xs ${rejectionReason.length > 0 ? "text-gray-500" : "text-gray-300"}`}>
                                    {rejectionReason.length} karakter
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={validating || !rejectionReason.trim()}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors shadow-md disabled:opacity-50"
                            >
                                {validating ? "Memproses..." : "Konfirmasi Tolak"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo lightbox */}
            {showPhotoUrl && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 cursor-zoom-out"
                    onClick={() => setShowPhotoUrl(null)}
                >
                    <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img src={showPhotoUrl} alt="preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                        <button
                            onClick={() => setShowPhotoUrl(null)}
                            className="absolute top-0 right-0 m-4 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-4 right-4 max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg z-[70]">
                    <p className={toast.type === "success" ? "text-green-700 font-medium" : "text-red-600 font-medium"}>
                        {toast.type === "success" ? "✓ " : "✕ "}{toast.message}
                    </p>
                </div>
            )}
        </div>
    );
}
