"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchMyHarvests, Harvest, HarvestStatus } from "@/lib/manage-harvest-api";
import { getSession } from "@/lib/auth";

export default function RiwayatPanenPage() {
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState<HarvestStatus | "">("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        const session = getSession();
        if (!session?.userId) return;

        try {
            const params: { startDate?: string; endDate?: string; status?: HarvestStatus } = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (statusFilter) params.status = statusFilter as HarvestStatus;

            const data = await fetchMyHarvests(session.userId, params);
            setHarvests(data.sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()));
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const handleReset = () => {
        setStartDate("");
        setEndDate("");
        setStatusFilter("");
        setTimeout(() => loadData(), 0);
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const statusBadge = (status: HarvestStatus) => {
        const map = {
            PENDING: { bg: "bg-[#fef3c7]", text: "text-[#92400e]", dot: "bg-[#f59e0b]", label: "Menunggu" },
            APPROVED: { bg: "bg-[#dcfce7]", text: "text-[#166534]", dot: "bg-[#10b981]", label: "Disetujui" },
            REJECTED: { bg: "bg-[#fee2e2]", text: "text-[#991b1b]", dot: "bg-red-500", label: "Ditolak" },
        };
        const s = map[status];
        return (
            <div className={`rounded-[20px] ${s.bg} flex items-center py-1.5 px-[12px] gap-1.5`}>
                <div className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                <div className={`relative text-[12px] leading-[14.4px] font-semibold ${s.text}`}>{s.label}</div>
            </div>
        );
    };

    return (
        <div className="w-full relative bg-[#f5f5f5] flex flex-col items-start text-left text-[20px] text-white min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
            `}</style>

            {/* Navbar */}
            <div className="w-full h-16 bg-white border-[#e5e7eb] border-solid border-b-[1px] box-border flex flex-col items-center sticky top-0 z-10">
                <div className="w-full max-w-[1360px] flex items-center justify-between py-4 px-10 box-border gap-5 shrink-0">
                    <Link href="/buruh" className="flex items-center gap-3 no-underline">
                        <div className="h-10 w-10 rounded-[8px] bg-[#496e00] flex flex-col items-center justify-center">
                            <b className="relative leading-6 text-white">P</b>
                        </div>
                        <b className="relative leading-6 text-[#4f5e3e]">Palmery</b>
                    </Link>
                    <div className="flex items-center gap-4 text-[16px] text-[#496e00]">
                        <div className="relative leading-[19.2px] font-semibold">Riwayat Panen</div>
                        <div className="rounded-[20px] bg-[#e5e7eb] flex items-center py-2 px-[12px] gap-2 text-[14px]">
                            <div className="h-8 w-8 rounded-2xl bg-[#9ca3af] flex flex-col items-center justify-center">
                                <div className="relative leading-[16.8px] font-semibold text-white">
                                    {getSession()?.name?.substring(0, 2).toUpperCase() || "BU"}
                                </div>
                            </div>
                            <div className="relative leading-[16.8px] font-medium text-[#4f5e3e]">
                                {getSession()?.name || "Buruh"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-[1440px] mx-auto bg-[#f5f5f5] flex flex-col items-start p-10 box-border gap-6 text-[14px] text-[#6b7280]">

                {/* Back Button */}
                <Link href="/buruh" className="no-underline rounded-md bg-[#6b7280] border-[#e5e7eb] border-solid border-[1px] flex items-center py-2 px-[12px] gap-2 hover:bg-opacity-90 transition-all">
                    <div className="relative leading-[16.8px] font-medium text-white">← Kembali</div>
                </Link>

                {/* Filter Card */}
                <div className="self-stretch rounded-xl bg-white border-[#e5e7eb] border-solid border-[1px] flex flex-col items-start p-6 gap-4 text-[#111827]">
                    <b className="relative text-[18px] leading-[21.6px]">Filter Riwayat Panen</b>
                    <form onSubmit={handleFilter} className="self-stretch flex flex-col sm:flex-row items-end gap-3 text-[14px]">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <label className="font-medium text-[#6b7280] text-[12px]">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-10 px-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#496e00] focus:border-transparent"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <label className="font-medium text-[#6b7280] text-[12px]">Tanggal Akhir</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-10 px-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#496e00] focus:border-transparent"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <label className="font-medium text-[#6b7280] text-[12px]">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as HarvestStatus | "")}
                                className="w-full h-10 px-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#496e00] focus:border-transparent"
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
                                className="h-10 px-4 border border-[#e5e7eb] rounded-lg text-[14px] font-medium text-[#6b7280] bg-white hover:bg-[#f9fafb] transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="h-10 px-5 bg-[#496e00] rounded-lg text-[14px] font-semibold text-white hover:bg-[#3b5900] transition-colors"
                            >
                                Terapkan
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Card */}
                <div className="self-stretch rounded-xl bg-white border-[#e5e7eb] border-solid border-[1px] overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#e5e7eb] flex items-center justify-between">
                        <div>
                            <b className="text-[18px] leading-[21.6px] text-[#111827]">Semua Riwayat Panen</b>
                            <p className="text-[12px] text-[#6b7280] mt-1">
                                {loading ? "Memuat..." : `${harvests.length} data ditemukan`}
                            </p>
                        </div>
                        <button onClick={loadData} className="text-[13px] text-[#496e00] font-semibold hover:underline">
                            Refresh
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Berat (kg)</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Catatan</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f3f4f6]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[14px] text-[#6b7280]">Memuat data...</td>
                                    </tr>
                                ) : harvests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[14px] text-[#6b7280] italic">
                                            Tidak ada data panen yang sesuai filter.
                                        </td>
                                    </tr>
                                ) : (
                                    harvests.map((h) => (
                                        <>
                                            <tr
                                                key={h.id}
                                                className="hover:bg-[#f9fafb] transition-colors cursor-pointer"
                                                onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-[#111827] text-[14px]">{formatDate(h.harvestDate)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-[#111827] text-[14px]">{h.kgHarvested} kg</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {statusBadge(h.status)}
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="text-[13px] text-[#6b7280] truncate">{h.notes}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[12px] text-[#496e00] font-medium">
                                                        {expandedId === h.id ? "▲ Tutup" : "▼ Buka"}
                                                    </span>
                                                </td>
                                            </tr>
                                            {expandedId === h.id && (
                                                <tr key={`${h.id}-detail`} className="bg-[#f9fafb]">
                                                    <td colSpan={5} className="px-6 py-4">
                                                        <div className="flex flex-col gap-3">
                                                            <div>
                                                                <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">Catatan Lengkap</p>
                                                                <p className="text-[14px] text-[#111827]">{h.notes}</p>
                                                            </div>
                                                            {h.status === "REJECTED" && h.rejectionReason && (
                                                                <div className="rounded-lg bg-[#fee2e2] border border-red-200 p-4">
                                                                    <p className="text-[11px] font-bold text-[#991b1b] uppercase tracking-wider mb-1">⚠ Alasan Penolakan</p>
                                                                    <p className="text-[14px] text-[#991b1b]">{h.rejectionReason}</p>
                                                                </div>
                                                            )}
                                                            {h.photos?.length > 0 && (
                                                                <div>
                                                                    <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Foto Bukti</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {h.photos.map((p, idx) => (
                                                                            <a key={idx} href={p.url} target="_blank" rel="noopener noreferrer">
                                                                                <img src={p.url} alt={`foto-${idx}`} className="w-20 h-20 object-cover rounded-lg border border-[#e5e7eb] hover:opacity-90 transition-opacity" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {h.validatedAt && (
                                                                <p className="text-[12px] text-[#6b7280]">
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
            </div>
        </div>
    );
}
