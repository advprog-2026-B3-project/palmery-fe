"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchHarvestsByWorker, Harvest, HarvestStatus } from "@/lib/manage-harvest-api";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function ProfilBuruhPage() {
    const params = useParams();
    const workerId = params.workerId as string;

    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showPhotoUrl, setShowPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            const session = getSession();
            if (!session?.userId) return;

            try {
                const data = await fetchHarvestsByWorker(workerId, session.userId, "MANDOR");
                setHarvests(data.sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()));
            } catch (err) {
                console.error("Failed to load worker data:", err);
            } finally {
                setLoading(false);
            }
        }
        if (workerId) loadData();
    }, [workerId]);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const totalKg = harvests.reduce((sum, h) => sum + h.kgHarvested, 0);
    const approvedCount = harvests.filter((h) => h.status === "APPROVED").length;
    const rejectedCount = harvests.filter((h) => h.status === "REJECTED").length;
    const pendingCount = harvests.filter((h) => h.status === "PENDING").length;
    const initials = workerId ? workerId.substring(0, 2).toUpperCase() : "BU";

    const statusBadge = (status: HarvestStatus) => {
        const map = {
            PENDING: { bg: "bg-[#fef3c7]", text: "text-[#92400e]", dot: "bg-[#f59e0b]", label: "Menunggu" },
            APPROVED: { bg: "bg-[#dcfce7]", text: "text-[#166534]", dot: "bg-[#10b981]", label: "Disetujui" },
            REJECTED: { bg: "bg-[#fee2e2]", text: "text-[#991b1b]", dot: "bg-red-500", label: "Ditolak" },
        };
        const s = map[status];
        return (
            <div className={`rounded-[20px] ${s.bg} inline-flex items-center py-1.5 px-[12px] gap-1.5`}>
                <div className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                <div className={`text-[12px] leading-[14.4px] font-semibold ${s.text}`}>{s.label}</div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
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
                    <span className="font-semibold text-[#496e00] text-sm hidden sm:block">Dashboard Mandor</span>
                    <div className="bg-gray-100 flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
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

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

                {/* Back */}
                <Link
                    href="/mandor/dashboard"
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-md text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                    ← Kembali ke Dashboard
                </Link>

                {/* Profil Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="h-20 w-20 rounded-full bg-[#dbeafe] flex flex-col items-center justify-center shrink-0">
                            <b className="text-[#1e40af] text-2xl">{initials}</b>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900">Buruh — {workerId?.substring(0, 8)}</h1>
                                <div className="rounded-full bg-[#dbeafe] px-4 py-1.5">
                                    <span className="text-[12px] font-semibold text-[#1e40af]">Buruh Terdaftar</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">ID: {workerId}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-[#f9fafb] rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-[#111827]">{loading ? "-" : harvests.length}</div>
                            <div className="text-xs text-[#6b7280] mt-1">Total Panen</div>
                        </div>
                        <div className="bg-[#f9fafb] rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-[#111827]">{loading ? "-" : `${totalKg.toLocaleString("id-ID")} kg`}</div>
                            <div className="text-xs text-[#6b7280] mt-1">Total Berat</div>
                        </div>
                        <div className="bg-[#dcfce7] rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-[#166534]">{loading ? "-" : approvedCount}</div>
                            <div className="text-xs text-[#166534] mt-1">Disetujui</div>
                        </div>
                        <div className="bg-[#fee2e2] rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-[#991b1b]">{loading ? "-" : rejectedCount}</div>
                            <div className="text-xs text-[#991b1b] mt-1">Ditolak</div>
                        </div>
                    </div>
                </div>

                {/* Riwayat Panen */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-gray-900 text-lg">Riwayat Panen Buruh</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {loading ? "Memuat..." : `${harvests.length} data · ${pendingCount} menunggu validasi`}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Berat (kg)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Foto</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">Memuat data...</td>
                                    </tr>
                                ) : harvests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                            Belum ada laporan panen dari buruh ini.
                                        </td>
                                    </tr>
                                ) : (
                                    harvests.map((h) => (
                                        <>
                                            <tr
                                                key={h.id}
                                                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-900">{formatDate(h.harvestDate)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900">{h.kgHarvested} kg</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex -space-x-2">
                                                        {h.photos?.length > 0 ? (
                                                            h.photos.slice(0, 3).map((p, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    onClick={(e) => { e.stopPropagation(); setShowPhotoUrl(p.url); }}
                                                                    className="w-8 h-8 rounded-md border-2 border-white bg-gray-200 overflow-hidden cursor-pointer hover:z-10 hover:scale-110 transition-all"
                                                                >
                                                                    <img src={p.url} alt="bukti" className="w-full h-full object-cover" />
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Tidak ada</span>
                                                        )}
                                                        {h.photos?.length > 3 && (
                                                            <div className="w-8 h-8 rounded-md border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                                +{h.photos.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{statusBadge(h.status)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-[#496e00] font-medium">
                                                        {expandedId === h.id ? "▲ Tutup" : "▼ Buka"}
                                                    </span>
                                                </td>
                                            </tr>
                                            {expandedId === h.id && (
                                                <tr key={`${h.id}-expand`} className="bg-gray-50">
                                                    <td colSpan={5} className="px-6 py-4">
                                                        <div className="flex flex-col gap-3">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan</p>
                                                                <p className="text-sm text-gray-700">{h.notes}</p>
                                                            </div>
                                                            {h.status === "REJECTED" && h.rejectionReason && (
                                                                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                                                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">⚠ Alasan Penolakan</p>
                                                                    <p className="text-sm text-red-700">{h.rejectionReason}</p>
                                                                </div>
                                                            )}
                                                            {h.validatedAt && (
                                                                <p className="text-xs text-gray-400">
                                                                    Divalidasi pada: {formatDate(h.validatedAt)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal Photo Viewer */}
            {showPhotoUrl && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 cursor-zoom-out"
                    onClick={() => setShowPhotoUrl(null)}
                >
                    <div className="relative max-w-4xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img src={showPhotoUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                        <button
                            onClick={() => setShowPhotoUrl(null)}
                            className="absolute top-0 right-0 m-4 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
