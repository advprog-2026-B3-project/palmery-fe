"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  approvePayroll,
  fetchPayrolls,
  fetchWageConfig,
  generatePayrollDraft,
  rejectPayroll,
  updateWageConfig,
  type PayrollSummary,
  type WageConfig,
} from "@/lib/payment-api";

type DraftFormState = {
  userId: string;
  role: string;
  quantityKg: string;
  description: string;
};

type WageFormState = {
  buruhRatePerKg: string;
  supirRatePerKg: string;
  mandorRatePerKg: string;
};

const initialDraftForm: DraftFormState = {
  userId: "buruh-demo",
  role: "BURUH",
  quantityKg: "100",
  description: "",
};

export default function AdminPayrollPage() {
  const [adminUserId, setAdminUserId] = useState("admin-utama");
  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [draftForm, setDraftForm] = useState<DraftFormState>(initialDraftForm);
  const [rejectReasons, setRejectReasons] = useState<Record<number, string>>({});
  const [payrolls, setPayrolls] = useState<PayrollSummary[]>([]);
  const [wages, setWages] = useState<WageFormState>({
    buruhRatePerKg: "",
    supirRatePerKg: "",
    mandorRatePerKg: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (nextStatusFilter = "", nextUserFilter = "") => {
    setLoading(true);
    setError(null);

    try {
      const [payrollData, wageData] = await Promise.all([
        fetchPayrolls({ status: nextStatusFilter || undefined, userId: nextUserFilter || undefined }),
        fetchWageConfig(),
      ]);
      setPayrolls(payrollData);
      syncWageForm(wageData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function syncWageForm(config: WageConfig) {
    setWages({
      buruhRatePerKg: String(config.buruhRatePerKg),
      supirRatePerKg: String(config.supirRatePerKg),
      mandorRatePerKg: String(config.mandorRatePerKg),
    });
  }

  async function handleGenerateDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Generating payroll draft...");
    setError(null);

    try {
      await generatePayrollDraft({
        userId: draftForm.userId,
        role: draftForm.role,
        quantityKg: Number(draftForm.quantityKg),
        description: draftForm.description || undefined,
      });
      setDraftForm(initialDraftForm);
      setStatus("Payroll draft created.");
      await loadData();
    } catch (draftError) {
      setStatus(null);
      setError(draftError instanceof Error ? draftError.message : "Unexpected error");
    }
  }

  async function handleUpdateWages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Updating wage config...");
    setError(null);

    try {
      const updated = await updateWageConfig({
        buruhRatePerKg: Number(wages.buruhRatePerKg),
        supirRatePerKg: Number(wages.supirRatePerKg),
        mandorRatePerKg: Number(wages.mandorRatePerKg),
      });
      syncWageForm(updated);
      setStatus("Wage config updated.");
      await loadData();
    } catch (wageError) {
      setStatus(null);
      setError(wageError instanceof Error ? wageError.message : "Unexpected error");
    }
  }

  async function handleApprove(payrollId: number) {
    setStatus(`Approving payroll #${payrollId}...`);
    setError(null);

    try {
      await approvePayroll(payrollId, adminUserId);
      setStatus(`Payroll #${payrollId} approved.`);
      await loadData();
    } catch (approveError) {
      setStatus(null);
      setError(approveError instanceof Error ? approveError.message : "Unexpected error");
    }
  }

  async function handleReject(payrollId: number) {
    setStatus(`Rejecting payroll #${payrollId}...`);
    setError(null);

    try {
      await rejectPayroll(payrollId, rejectReasons[payrollId] ?? "");
      setStatus(`Payroll #${payrollId} rejected.`);
      await loadData();
    } catch (rejectError) {
      setStatus(null);
      setError(rejectError instanceof Error ? rejectError.message : "Unexpected error");
    }
  }

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadData(statusFilter, userFilter);
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Admin Payroll Desk</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Simple interface for draft generation, wage config, and payroll approval flow.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/topup"
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Open Top-Up
              </Link>
              <Link
                href="/"
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold">Generate Payroll Draft</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Temporary manual trigger while broker-driven event consumers are still missing.
            </p>
            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleGenerateDraft}>
              <input
                value={draftForm.userId}
                onChange={(event) => setDraftForm({ ...draftForm, userId: event.target.value })}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="User ID"
                required
              />
              <select
                value={draftForm.role}
                onChange={(event) => setDraftForm({ ...draftForm, role: event.target.value })}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              >
                <option value="BURUH">BURUH</option>
                <option value="SUPIR">SUPIR</option>
                <option value="MANDOR">MANDOR</option>
              </select>
              <input
                type="number"
                min="1"
                step="0.01"
                value={draftForm.quantityKg}
                onChange={(event) => setDraftForm({ ...draftForm, quantityKg: event.target.value })}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Quantity (Kg)"
                required
              />
              <input
                value={draftForm.description}
                onChange={(event) => setDraftForm({ ...draftForm, description: event.target.value })}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Description"
              />
              <button
                type="submit"
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 md:col-span-2"
              >
                Create Draft
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold">Wage Config</h2>
            <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleUpdateWages}>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={wages.buruhRatePerKg}
                onChange={(event) => setWages({ ...wages, buruhRatePerKg: event.target.value })}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Buruh / Kg"
                required
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={wages.supirRatePerKg}
                onChange={(event) => setWages({ ...wages, supirRatePerKg: event.target.value })}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Supir / Kg"
                required
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={wages.mandorRatePerKg}
                onChange={(event) => setWages({ ...wages, mandorRatePerKg: event.target.value })}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Mandor / Kg"
                required
              />
              <button
                type="submit"
                className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-sky-400 md:col-span-3"
              >
                Save Wage Config
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Pending and Processed Payrolls</h2>
              <p className="mt-1 text-sm text-zinc-300">
                Use admin wallet <span className="font-medium text-zinc-100">{adminUserId}</span> for approvals.
              </p>
            </div>
            <input
              value={adminUserId}
              onChange={(event) => setAdminUserId(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="Admin wallet user ID"
            />
          </div>

          <form className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]" onSubmit={handleFilterSubmit}>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
            >
              <option value="">Semua status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <input
              value={userFilter}
              onChange={(event) => setUserFilter(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="Filter by user ID"
            />
            <button
              type="submit"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
            >
              Refresh
            </button>
          </form>

          {status ? <p className="mt-4 text-sm text-emerald-300">{status}</p> : null}
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-left text-zinc-300">
                  <th className="pb-2 pr-3">ID</th>
                  <th className="pb-2 pr-3">User</th>
                  <th className="pb-2 pr-3">Role</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2 pr-3">Amount</th>
                  <th className="pb-2 pr-3">Detail</th>
                  <th className="pb-2 pr-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-4 text-zinc-300" colSpan={7}>
                      Loading payrolls...
                    </td>
                  </tr>
                ) : payrolls.length === 0 ? (
                  <tr>
                    <td className="py-4 text-zinc-300" colSpan={7}>
                      No payroll records found.
                    </td>
                  </tr>
                ) : (
                  payrolls.map((payroll) => (
                    <tr key={payroll.id} className="border-b border-zinc-800 align-top">
                      <td className="py-3 pr-3">{payroll.id}</td>
                      <td className="py-3 pr-3">{payroll.userId}</td>
                      <td className="py-3 pr-3">{payroll.type}</td>
                      <td className="py-3 pr-3">{payroll.status}</td>
                      <td className="py-3 pr-3">SD {payroll.amount}</td>
                      <td className="py-3 pr-3">
                        <p>{payroll.description}</p>
                        <p className="mt-1 text-zinc-300">{payroll.calculationDetail}</p>
                        {payroll.rejectionReason ? (
                          <p className="mt-1 text-rose-300">Alasan: {payroll.rejectionReason}</p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">
                        {payroll.status === "PENDING" ? (
                          <div className="flex min-w-[220px] flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => void handleApprove(payroll.id)}
                              className="rounded-md bg-emerald-600 px-3 py-2 text-left font-medium text-white hover:bg-emerald-500"
                            >
                              Approve
                            </button>
                            <input
                              value={rejectReasons[payroll.id] ?? ""}
                              onChange={(event) =>
                                setRejectReasons({
                                  ...rejectReasons,
                                  [payroll.id]: event.target.value,
                                })
                              }
                              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                              placeholder="Reject reason"
                            />
                            <button
                              type="button"
                              onClick={() => void handleReject(payroll.id)}
                              className="rounded-md border border-rose-700 px-3 py-2 text-left font-medium text-rose-300 hover:bg-rose-950/40"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400">No action</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
