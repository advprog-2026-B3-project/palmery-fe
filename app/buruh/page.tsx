"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchMyHarvests, Harvest } from "@/lib/manage-harvest-api";
import { getSession } from "@/lib/auth";

export default function BuruhDashboard() {
    const today = new Date().toISOString().split("T")[0];
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [loading, setLoading] = useState(true);
    const todaySubmitted = !loading && harvests.some(
        (h) => h.harvestDate === today || h.harvestDate.startsWith(today)
    );

    useEffect(() => {
    const fetchData = async () => {
            const session = getSession();
            if (!session?.userId) return;

            try {
                const data = await fetchMyHarvests(session.userId);
                setHarvests(data.sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()));
            } catch (err) {
                console.error("Failed to load history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className="w-full relative bg-[#f5f5f5] flex flex-col items-start text-left text-[20px] text-white min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {/* Font Import Hack (Self-contained) */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
            `}</style>

            {/* Header / Navbar */}
            <div className="w-full h-16 bg-white border-[#e5e7eb] border-solid border-b-[1px] box-border flex flex-col items-center sticky top-0 z-10">
                <div className="w-full max-w-[1360px] flex items-center justify-between py-4 px-10 box-border gap-5 shrink-0">
                    <Link href="/buruh" className="flex items-center gap-3 no-underline">
                        <div className="h-10 w-10 rounded-[8px] bg-[#496e00] flex flex-col items-center justify-center">
                            <b className="relative leading-6 text-white">P</b>
                        </div>
                        <b className="relative leading-6 text-[#4f5e3e]">Palmery</b>
                    </Link>
                    <div className="flex items-center gap-4 text-[16px] text-[#496e00]">
                        <div className="relative leading-[19.2px] font-semibold">Buruh Dashboard</div>
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
                
                {/* Warning Banner — sudah submit hari ini */}
                {todaySubmitted && (
                    <div className="self-stretch rounded-xl bg-[#fef3c7] border border-[#fde68a] flex items-start gap-3 p-4">
                        <span className="text-xl shrink-0">⚠️</span>
                        <div>
                            <p className="font-semibold text-[#92400e] text-[14px]">Kamu sudah mencatat panen hari ini</p>
                            <p className="text-[12px] text-[#b45309] mt-0.5">Input panen baru hanya bisa dilakukan besok. Cek status laporan kamu di Riwayat Panen.</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="self-stretch flex items-center justify-between">
                    <Link href="/" className="no-underline rounded-md bg-[#6b7280] border-[#e5e7eb] border-solid border-[1px] flex items-center py-2 px-[12px] gap-2 hover:bg-opacity-90 transition-all">
                        <div className="relative leading-[16.8px] font-medium text-white">← Kembali</div>
                    </Link>
                    
                    <Link
                        href="/buruh/input-panen"
                        className={`no-underline rounded-md border-solid border-[1px] flex items-center py-2 px-[12px] gap-2 transition-all shadow-md ${
                            todaySubmitted
                                ? "bg-[#9ca3af] border-[#9ca3af] cursor-not-allowed opacity-60"
                                : "bg-[#496e00] border-[#496e00] hover:bg-opacity-90"
                        }`}
                    >
                        <div className="relative leading-[16.8px] font-bold text-white">
                            {todaySubmitted ? "✓ Sudah Input Hari Ini" : "+ Catat Hasil Panen"}
                        </div>
                    </Link>
                </div>

                <div className="self-stretch flex flex-col lg:flex-row items-start gap-6 text-[18px] text-[#111827]">
                    
                    {/* Left Column */}
                    <div className="w-full lg:w-[720px] flex flex-col items-start gap-6">
                        
                        {/* Profile Card */}
                        <div className="self-stretch rounded-xl bg-white border-[#e5e7eb] border-solid border-[1px] flex flex-col items-start p-6 text-[28px] text-[#1e40af]">
                            <div className="self-stretch flex items-center gap-4">
                                <div className="h-20 w-20 rounded-[40px] bg-[#dbeafe] flex flex-col items-center justify-center">
                                    <b className="relative leading-[33.6px]">
                                        {getSession()?.name?.substring(0, 2).toUpperCase() || "BU"}
                                    </b>
                                </div>
                                <div className="flex flex-col items-start gap-1.5 text-[14px] text-[#111827]">
                                    <b className="relative text-[24px] leading-[28.8px]">{getSession()?.name || "Buruh"}</b>
                                    <div className="rounded-[20px] bg-[#dbeafe] flex items-center py-2 px-[16px] text-[#1e40af]">
                                        <div className="relative leading-[16.8px] font-semibold">Buruh Terdaftar</div>
                                    </div>
                                    <div className="relative leading-[16.8px] text-[#6b7280]">{getSession()?.email || "buruh@palmery.com"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Mandor Card */}
                        <div className="self-stretch rounded-xl bg-white border-[#e5e7eb] border-solid border-[1px] flex flex-col items-start p-6 gap-4">
                            <b className="self-stretch relative leading-[21.6px]">Mandor Pengawas</b>
                            <div className="self-stretch rounded-[8px] bg-[#f9fafb] flex items-center p-[16px] gap-3 text-[14px] text-[#92400e]">
                                <div className="h-10 w-10 rounded-[20px] bg-[#fef3c7] flex flex-col items-center justify-center">
                                    <div className="relative leading-[16.8px] font-semibold">SR</div>
                                </div>
                                <div className="flex-1 flex flex-col items-start gap-1 text-[#111827]">
                                    <div className="self-stretch relative leading-[16.8px] font-semibold">Slamet Riyadi</div>
                                    <div className="self-stretch relative text-[12px] leading-[14.4px] text-[#6b7280]">Mandor Kebun Blok A, B, C</div>
                                </div>
                            </div>
                        </div>

                        {/* Riwayat Panen */}
                        <div className="self-stretch rounded-xl bg-white border-[#e5e7eb] border-solid border-[1px] flex flex-col items-start p-6 gap-4">
                            <div className="self-stretch flex items-center justify-between">
                                <b className="relative leading-[21.6px]">Riwayat Panen Terakhir</b>
                                <Link href="/buruh/history" className="text-[12px] text-[#496e00] font-semibold hover:underline no-underline">Lihat Semua</Link>
                            </div>
                            
                            <div className="self-stretch flex flex-col items-start gap-2 text-[14px]">
                                {loading ? (
                                    <div className="p-4 text-center w-full text-[#6b7280]">Memuat data...</div>
                                ) : harvests.length === 0 ? (
                                    <div className="p-8 text-center w-full text-[#6b7280] italic">Belum ada laporan panen.</div>
                                ) : (
                                    harvests.slice(0, 5).map((h) => (
                                        <div key={h.id} className="self-stretch rounded-[8px] bg-[#f9fafb] flex flex-col items-start p-[16px] gap-2">
                                            <div className="w-full flex items-center justify-between gap-5">
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="relative leading-[16.8px] font-medium text-[#111827]">{formatDate(h.harvestDate)}</div>
                                                    <div className="flex items-center gap-1.5 text-[12px]">
                                                        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                                            h.status === "APPROVED" ? "bg-[#10b981]" : 
                                                            h.status === "REJECTED" ? "bg-red-500" : "bg-[#f59e0b]"
                                                        }`} />
                                                        <div className={`relative leading-[14.4px] font-semibold ${
                                                            h.status === "APPROVED" ? "text-[#10b981]" : 
                                                            h.status === "REJECTED" ? "text-red-500" : "text-[#f59e0b]"
                                                        }`}>
                                                            {h.status === "APPROVED" ? "Disetujui" : h.status === "REJECTED" ? "Ditolak" : "Menunggu"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="relative text-[16px] leading-[19.2px] font-semibold text-[#111827]">{h.kgHarvested} kg</div>
                                            </div>
                                            {h.status === "REJECTED" && h.rejectionReason && (
                                                <div className="w-full rounded-[6px] bg-[#fee2e2] border border-red-200 px-3 py-2">
                                                    <p className="text-[11px] font-bold text-[#991b1b] mb-0.5">⚠ Alasan Penolakan:</p>
                                                    <p className="text-[12px] text-[#991b1b]">{h.rejectionReason}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Payroll) */}
                    <div className="w-full lg:w-[600px] flex flex-col items-start">
                        <div className="self-stretch rounded-xl bg-white border-[#e5e7eb] border-solid border-[1px] flex flex-col items-start p-6 gap-4">
                            <b className="self-stretch relative leading-[21.6px]">Daftar Pembayaran (Payroll)</b>
                            <div className="self-stretch flex flex-col items-start gap-2 text-[14px]">
                                
                                {/* Dummy Payroll 1 */}
                                <div className="self-stretch rounded-[8px] bg-[#f9fafb] flex flex-col items-start p-[16px] gap-2">
                                    <div className="self-stretch flex items-center justify-between gap-5">
                                        <div className="relative leading-[16.8px] font-semibold text-[#111827]">Mei 2024 (Periode 1)</div>
                                        <div className="rounded-2xl bg-[#fef3c7] flex items-center py-1.5 px-[12px] gap-1.5 text-[12px] text-[#92400e]">
                                            <div className="h-1.5 w-1.5 rounded-[3px] bg-[#f59e0b] flex flex-col items-start" />
                                            <div className="relative leading-[14.4px] font-semibold">Memproses</div>
                                        </div>
                                    </div>
                                    <div className="self-stretch flex items-center justify-between gap-5 text-[13px] text-[#6b7280]">
                                        <div className="relative leading-[15.6px]">Total 450 kg</div>
                                        <b className="relative text-[16px] leading-[19.2px] text-[#111827]">Rp 4.500.000</b>
                                    </div>
                                </div>

                                {/* Dummy Payroll 2 */}
                                <div className="self-stretch rounded-[8px] bg-[#f9fafb] flex flex-col items-start p-[16px] gap-2">
                                    <div className="self-stretch flex items-center justify-between gap-5">
                                        <div className="relative leading-[16.8px] font-semibold text-[#111827]">April 2024</div>
                                        <div className="rounded-2xl bg-[#dcfce7] flex items-center py-1.5 px-[12px] gap-1.5 text-[12px] text-[#166534]">
                                            <div className="h-1.5 w-1.5 rounded-[3px] bg-[#10b981] flex flex-col items-start" />
                                            <div className="relative leading-[14.4px] font-semibold">Dibayarkan</div>
                                        </div>
                                    </div>
                                    <div className="self-stretch flex items-center justify-between gap-5 text-[13px] text-[#6b7280]">
                                        <div className="relative leading-[15.6px]">Total 1.250 kg</div>
                                        <b className="relative text-[16px] leading-[19.2px] text-[#111827]">Rp 12.500.000</b>
                                    </div>
                                </div>

                                {/* Dummy Payroll 3 */}
                                <div className="self-stretch rounded-[8px] bg-[#f9fafb] flex flex-col items-start p-[16px] gap-2">
                                    <div className="self-stretch flex items-center justify-between gap-5">
                                        <div className="relative leading-[16.8px] font-semibold text-[#111827]">Maret 2024</div>
                                        <div className="rounded-2xl bg-[#dcfce7] flex items-center py-1.5 px-[12px] gap-1.5 text-[12px] text-[#166534]">
                                            <div className="h-1.5 w-1.5 rounded-[3px] bg-[#10b981] flex flex-col items-start" />
                                            <div className="relative leading-[14.4px] font-semibold">Dibayarkan</div>
                                        </div>
                                    </div>
                                    <div className="self-stretch flex items-center justify-between gap-5 text-[13px] text-[#6b7280]">
                                        <div className="relative leading-[15.6px]">Total 980 kg</div>
                                        <b className="relative text-[16px] leading-[19.2px] text-[#111827]">Rp 9.800.000</b>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
