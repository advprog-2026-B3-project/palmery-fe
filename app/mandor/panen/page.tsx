"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAllHarvests, Harvest, HarvestStatus } from "@/lib/manage-harvest-api";
import { getSession } from "@/lib/auth";

export default function MandorPanenListPage() {
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState("");
    const [filterStatus, setFilterStatus] = useState<HarvestStatus | "">("");

    const loadData = async () => {
        setLoading(true);
        const session = getSession();
        if (!session?.userId) return;

        try {
            const params: { date?: string } = {};
            if (filterDate) params.date = filterDate;
            const data = await fetchAllHarvests(session.userId, params);

            const filtered = filterStatus
                ? data.filter((h) => h.status === filterStatus)
                : data;

            setHarvests(
                filtered.sort(
                    (a, b) =>
                        new Date(b.harvestDate).getTime() -
                        new Date(a.harvestDate).getTime()
                )
            );
        } catch (err) {
            console.error("Failed to load harvests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const handleReset = () => {
        setFilterDate("");
        setFilterStatus("");
        setTimeout(loadData, 0);
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const pendingCount = harvests.filter((h) => h.status === "PENDING").length;
    const totalKg = harvests.reduce((sum, h) => sum + h.kgHarvested, 0);

    const statusBadge = (status: HarvestStatus) => {
        const map: Record<HarvestStatus, { bg: string; text: string; label: string }> = {
            PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu" },
            APPROVED: { bg: "bg-green-100", text: "text-green-700", label: "Disetujui" },
            REJECTED: { bg: "bg-red-100", text: "text-red-700", label: "Ditolak" },
        };
        const s = map[status];
        return (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                {s.label}
            </span>
        );
    };

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
                    <span className="font-semibold text-[#496e00] text-sm hidden sm:block">Validasi Panen</span>
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

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link href="/mandor/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
                            ← Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan Panen Buruh</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {loading ? "Memuat..." : `${harvests.length} laporan · ${pendingCount} menunggu validasi · ${totalKg.toLocaleString("id-ID")} kg total`}
                        </p>
                    </div>
                    <button
                        onClick={loadData}
                        className="text-sm text-[#496e00] font-semibold border border-[#496e00] px-4 py-2 rounded-lg hover:bg-[#496e00] hover:text-white transition-colors shrink-0"
                    >
                        Refresh
                    </button>
                </div>

                {/* Filter Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal Panen</label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496e00] focus:border-transparent"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as HarvestStatus | "")}
                                className="h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496e00] focus:border-transparent bg-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="PENDING">Menunggu</option>
                                <option value="APPROVED">Disetujui</option>
                                <option value="REJECTED">Ditolak</option>
                            </select>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="h-10 px-5 bg-[#496e00] rounded-lg text-sm font-semibold text-white hover:bg-[#3b5900] transition-colors"
                            >
                                Terapkan
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Buruh</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Panen</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Berat (kg)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Foto</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">Memuat data...</td>
                                    </tr>
                                ) : harvests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                            Tidak ada laporan panen yang sesuai filter.
                                        </td>
                                    </tr>
                                ) : (
                                    harvests.map((h) => (
                                        <tr key={h.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/mandor/buruh/${h.workerId}`} className="flex items-center gap-3 group">
                                                    <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                                                        <span className="font-bold text-blue-800 text-xs">
                                                            {h.workerId.substring(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 group-hover:text-[#496e00] group-hover:underline transition-colors">
                                                        {h.workerId.substring(0, 8)}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">{formatDate(h.harvestDate)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">{h.kgHarvested} kg</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex -space-x-2">
                                                    {h.photos?.length > 0 ? (
                                                        <>
                                                            {h.photos.slice(0, 3).map((p, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="w-8 h-8 rounded-md border-2 border-white bg-gray-200 overflow-hidden"
                                                                >
                                                                    <img src={p.url} alt="foto" className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                            {h.photos.length > 3 && (
                                                                <div className="w-8 h-8 rounded-md border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                                    +{h.photos.length - 3}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">–</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{statusBadge(h.status)}</td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/mandor/panen/${h.id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#496e00] border border-[#496e00] px-3 py-1.5 rounded-lg hover:bg-[#496e00] hover:text-white transition-colors"
                                                >
                                                    Lihat Detail →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
