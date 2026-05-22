"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getWageConfig, updateWageConfig } from "@/lib/api";

export default function WageConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({ buruhPerKg: "", supirPerKg: "", mandorPerKg: "" });

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const data = await getWageConfig();
      setForm({
        buruhPerKg: String(data.buruhRatePerKg ?? ""),
        supirPerKg: String(data.supirRatePerKg ?? ""),
        mandorPerKg: String(data.mandorRatePerKg ?? ""),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateWageConfig({
        buruhRatePerKg: parseFloat(form.buruhPerKg) || undefined,
        supirRatePerKg: parseFloat(form.supirPerKg) || undefined,
        mandorRatePerKg: parseFloat(form.mandorPerKg) || undefined,
      });
      setSuccess("Konfigurasi upah berhasil diperbarui.");
      loadConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="max-w-2xl">
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/payroll" className="hover:text-[var(--color-primary)]">Payroll</Link>
          <span className="mx-2">›</span>
          <span>Konfigurasi Upah</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">Konfigurasi Upah</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          Atur nilai upah per kilogram untuk setiap role pekerja.
        </p>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 mb-4">{success}</div>}

        {loading ? (
          <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Upah Buruh per Kg (SawitDollar)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.buruhPerKg}
                  onChange={(e) => setForm((f) => ({ ...f, buruhPerKg: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Upah Supir per Kg (SawitDollar)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.supirPerKg}
                  onChange={(e) => setForm((f) => ({ ...f, supirPerKg: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Upah Mandor per Kg (SawitDollar)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.mandorPerKg}
                  onChange={(e) => setForm((f) => ({ ...f, mandorPerKg: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
