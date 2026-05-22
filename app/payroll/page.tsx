"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/useAuth";
import { getPayrolls, getWallet, approvePayroll, rejectPayroll, type PayrollSummary, type WalletDashboard } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

export default function PayrollPage() {
  const { isAdmin } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollSummary[]>([]);
  const [wallet, setWallet] = useState<WalletDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const authUser = getAuthUser();
      const userId = isAdmin ? undefined : authUser?.sub;

      const [payrollData, walletData] = await Promise.all([
        getPayrolls(filterStatus || undefined, userId),
        authUser?.sub ? getWallet(authUser.sub, filterStatus || undefined) : Promise.resolve(null),
      ]);
      setPayrolls(payrollData);
      setWallet(walletData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(payrollId: number) {
    const authUser = getAuthUser();
    if (!authUser) return;
    try {
      await approvePayroll(payrollId, authUser.sub);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    }
  }

  async function handleReject(payrollId: number) {
    if (!rejectReason.trim()) {
      setError("Alasan penolakan harus diisi");
      return;
    }
    try {
      await rejectPayroll(payrollId, rejectReason);
      setRejectId(null);
      setRejectReason("");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    }
  }

  function statusBadge(status: string) {
    switch (status.toUpperCase()) {
      case "ACCEPTED":
      case "APPROVED":
        return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Accepted</span>;
      case "REJECTED":
        return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>;
      default:
        return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Payroll</h1>
            <p className="text-[var(--color-text-muted)] mt-1">
              {isAdmin ? "Kelola payroll semua pekerja." : "Lihat riwayat payroll Anda."}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <Link
                href="/payroll/config"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)] transition-colors"
              >
                ⚙️ Konfigurasi Upah
              </Link>
              <Link
                href="/payroll/topup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
              >
                💰 Top Up Saldo
              </Link>
            </div>
          )}
        </div>

        {/* Wallet Balance */}
        {wallet && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Saldo Wallet</p>
                <p className="text-3xl font-bold text-[var(--color-primary)]">
                  {wallet.balance.toLocaleString("id-ID")} <span className="text-sm font-normal">SawitDollar</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3 mb-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading && <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>}

        {!loading && payrolls.length === 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
            <p className="text-[var(--color-text-muted)]">Belum ada data payroll.</p>
          </div>
        )}

        {!loading && payrolls.length > 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">ID</th>
                  {isAdmin && <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Pekerja</th>}
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Jumlah</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Deskripsi</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Tanggal</th>
                  {isAdmin && <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--color-border-light)] last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">#{p.id}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.userName ?? p.userId.slice(0, 8)}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{p.type}</div>
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium">{p.amount.toLocaleString("id-ID")} SD</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] max-w-[200px] truncate">{p.description}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {p.status.toUpperCase() === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectId(p.id)}
                              className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {p.rejectionReason && <p className="text-xs text-red-500 mt-1">Alasan: {p.rejectionReason}</p>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reject Modal */}
        {rejectId !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="font-bold mb-3">Tolak Payroll #{rejectId}</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm resize-none h-24 mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="px-4 py-2 text-sm rounded-full border border-[var(--color-border)]">
                  Batal
                </button>
                <button onClick={() => handleReject(rejectId)} className="px-4 py-2 text-sm rounded-full bg-red-600 text-white">
                  Tolak
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
