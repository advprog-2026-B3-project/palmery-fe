"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAllHarvests, validateHarvest, Harvest } from "@/lib/manage-harvest-api";
import { getSession } from "@/lib/auth";

export default function DashboardMandor() {
    const today = new Date().toISOString().split("T")[0];
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [validatingId, setValidatingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showPhotoUrl, setShowPhotoUrl] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        const session = getSession();
        if (!session?.userId) return;

        try {
            const data = await fetchAllHarvests(session.userId, { date: today });
            setHarvests(data);
        } catch (err) {
            console.error("Failed to load harvests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [today]);

    const handleApprove = async (id: string) => {
        if (!confirm("Setujui laporan panen ini?")) return;
        setValidatingId(id);
        const session = getSession();
        if (!session?.userId) return;

        try {
            await validateHarvest(id, session.userId, "APPROVED");
            await loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Gagal menyetujui.");
        } finally {
            setValidatingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectingId) return;
        if (!rejectionReason.trim()) {
            alert("Alasan penolakan wajib diisi.");
            return;
        }
        setValidatingId(rejectingId);
        const session = getSession();
        if (!session?.userId) return;

        try {
            await validateHarvest(rejectingId, session.userId, "REJECTED", rejectionReason);
            setRejectingId(null);
            setRejectionReason("");
            await loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Gagal menolak.");
        } finally {
            setValidatingId(null);
        }
    };

    const totalWeight = harvests.reduce((sum, h) => sum + h.kgHarvested, 0);
    const pendingCount = harvests.filter(h => h.status === "PENDING").length;

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
                    <span className="font-semibold text-[#496e00] text-sm hidden sm:block">Beranda</span>
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

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                
                {/* Header & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Mandor</h1>
                        <p className="text-gray-500 text-sm mt-1">Selamat datang kembali, {getSession()?.name || "Mandor"}.</p>
                    </div>
                    <button className="bg-[#496e00] hover:bg-[#3f5d00] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Create Pengiriman
                    </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
                    
                    {/* Left Column (Main Stats) */}
                    <div className="lg:col-span-12 space-y-6">
                        
                        {/* Profile Summary */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center sm:flex-row sm:justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="h-20 w-20 rounded-full bg-[#fef3c7] flex flex-col items-center justify-center shrink-0">
                                    <b className="text-[#92400e] text-2xl">
                                        {getSession()?.name?.substring(0, 2).toUpperCase() || "MA"}
                                    </b>
                                </div>
                                <div className="flex flex-col items-start gap-1.5">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-2xl font-bold text-gray-900">{getSession()?.name || "Mandor"}</h2>
                                        <div className="rounded-full bg-[#fef3c7] px-4 py-1.5">
                                            <span className="text-[12px] font-semibold text-[#92400e]">Mandor Kebun</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">{getSession()?.email || "mandor@palmery.com"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Hasil Panen */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-gray-900 text-lg">Validasi Hasil Panen (Hari Ini)</h2>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        Total {totalWeight.toLocaleString("id-ID")} kg · {pendingCount} menunggu validasi
                                    </p>
                                </div>
                                <button onClick={loadData} className="text-sm text-[#496e00] font-medium hover:underline">
                                    Refresh
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Buruh</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Berat (Kg)</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Foto Bukti</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Catatan</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">Memuat data...</td>
                                            </tr>
                                        ) : harvests.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">Belum ada laporan panen hari ini.</td>
                                            </tr>
                                        ) : (
                                            harvests.map((h) => (
                                                <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <Link href={`/mandor/buruh/${h.workerId}`} className="flex items-center gap-3 group" onClick={(e) => e.stopPropagation()}>
                                                            <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                                                                <span className="font-bold text-blue-800 text-xs">{h.workerId.substring(0,2).toUpperCase()}</span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900 group-hover:text-[#496e00] group-hover:underline transition-colors">{h.workerId.substring(0,8)}</span>
                                                        </Link>
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
                                                                        onClick={() => setShowPhotoUrl(p.url)}
                                                                        className="w-8 h-8 rounded-md border-2 border-white bg-gray-200 overflow-hidden cursor-pointer hover:z-10 hover:scale-110 transition-all"
                                                                    >
                                                                        <img src={p.url} alt="bukti" className="w-full h-full object-cover" />
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-gray-400">Tidak ada foto</span>
                                                            )}
                                                            {h.photos?.length > 3 && (
                                                                <div className="w-8 h-8 rounded-md border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                                    +{h.photos.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs">
                                                        <p className="text-xs text-gray-500 truncate" title={h.notes}>{h.notes}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                            h.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                                            h.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                            "bg-red-100 text-red-700"
                                                        }`}>
                                                            {h.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {h.status === "PENDING" ? (
                                                            <div className="flex items-center gap-2">
                                                                <button 
                                                                    disabled={validatingId === h.id}
                                                                    onClick={() => handleApprove(h.id)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                                    title="Setujui"
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                </button>
                                                                <button 
                                                                    disabled={validatingId === h.id}
                                                                    onClick={() => setRejectingId(h.id)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                                    title="Tolak"
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                        <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-gray-400 font-medium">Validasi Selesai</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Rejection */}
            {rejectingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Tolak Laporan Panen</h3>
                            <button onClick={() => setRejectingId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-red-50 p-4 rounded-lg">
                                <p className="text-xs text-red-700 leading-relaxed">
                                    Memberikan penolakan akan mengirimkan notifikasi kepada Buruh. 
                                    <b> Alasan wajib diisi</b> agar Buruh dapat memperbaiki laporan.
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Alasan Penolakan</label>
                                <textarea 
                                    autoFocus
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                    rows={4}
                                    placeholder="Contoh: Berat tidak sesuai dengan foto timbangan..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                            <button 
                                onClick={() => setRejectingId(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleReject}
                                disabled={validatingId !== null}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                            >
                                {validatingId ? "Memproses..." : "Konfirmasi Tolak"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Photo Viewer */}
            {showPhotoUrl && (
                <div 
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 cursor-zoom-out"
                    onClick={() => setShowPhotoUrl(null)}
                >
                    <div className="relative max-w-4xl w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
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
