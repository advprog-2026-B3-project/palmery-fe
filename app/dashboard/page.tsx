"use client";

import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome to Palmery 🌴
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            How can we help you today, Mr Gung?
          </p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Manajemen Kebun Sawit - large card */}
          <div className="md:col-span-2 bg-white rounded-xl border border-[var(--color-border)] p-6 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">Manajemen Kebun Sawit</h3>
              <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
                Oversee field activities, parcel health, and environmental data for all plantation locations.
              </p>
            </div>
            <Link href="/dashboard" className="text-sm font-medium text-[var(--color-primary)] mt-4 inline-flex items-center gap-1 hover:underline">
              View Dashboard →
            </Link>
          </div>

          {/* Manajemen Hasil Panen */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12V2"/><path d="M12 2a14.5 14.5 0 0 1 0 20"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">Manajemen Hasil Panen</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Track daily yield metrics and bunch counts across sectors.
              </p>
            </div>
            <Link
              href="/panen"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-border-light)] transition-colors"
            >
              Record Panen
            </Link>
          </div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Manajemen Pengiriman</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Logistics tracking from field collection to refinery delivery.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Manajemen Pembayaran</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Automated worker payroll and operational expense tracking.
            </p>
          </div>

          <div className="bg-[var(--color-bg-dark)] rounded-xl p-6 text-white">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-1">SawitBid</h3>
            <p className="text-sm text-white/70">
              Access real-time commodity auctions and market price feeds.
            </p>
            <p className="text-xs font-semibold text-[var(--color-accent)] mt-3 uppercase tracking-wider">
              Live Auctions
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <button className="text-sm text-[var(--color-primary)] font-medium hover:underline">
              See All
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Activity ID</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Metric</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--color-border-light)]">
                  <td className="px-4 py-3 font-mono text-xs">#PK-2045</td>
                  <td className="px-4 py-3">Sektor Utara - Blok B</td>
                  <td className="px-4 py-3">1,240 Kg Panen</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">⋮</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">#PK-2046</td>
                  <td className="px-4 py-3">Sektor Barat - Blok A</td>
                  <td className="px-4 py-3">842 Kg Panen</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Processing
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">⋮</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
