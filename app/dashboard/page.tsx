"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/useAuth";
import {
  getActivePengirimanMandor,
  getActivePengirimanSupir,
  getHarvests,
  getMyHarvests,
  getPayrolls,
  getPendingPengiriman,
  getPlantations,
} from "@/lib/api";

type DashboardMetric = {
  label: string;
  value: string;
  href: string;
};

type RecentActivity = {
  id: string;
  location: string;
  metric: string;
  status: string;
  href: string;
};

export default function DashboardPage() {
  const { user, role, isAdmin, isMandor, isBuruh, isSupir } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      loadDashboard();
    }
  }, [role]);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const [plantations, pendingShipments, pendingPayrolls] = await Promise.all([
          getPlantations(),
          getPendingPengiriman(),
          getPayrolls("PENDING"),
        ]);
        setMetrics([
          { label: "Kebun", value: String(plantations.length), href: "/kebun" },
          { label: "Review Pengiriman", value: String(pendingShipments.length), href: "/pengiriman" },
          { label: "Payroll Pending", value: String(pendingPayrolls.length), href: "/payroll" },
        ]);
        setActivities(pendingShipments.slice(0, 5).map((shipment) => ({
          id: shipment.id,
          location: shipment.kebun_id,
          metric: `${shipment.total_kg} kg pengiriman`,
          status: shipment.admin_approval_status,
          href: `/pengiriman/${shipment.id}`,
        })));
      } else if (isMandor) {
        const [plantations, harvests, shipments] = await Promise.all([
          getPlantations(),
          getHarvests(),
          getActivePengirimanMandor(),
        ]);
        setMetrics([
          { label: "Kebun Akses", value: String(plantations.length), href: "/kebun" },
          { label: "Panen Masuk", value: String(harvests.length), href: "/panen" },
          { label: "Pengiriman Aktif", value: String(shipments.length), href: "/pengiriman" },
        ]);
        setActivities(harvests.slice(0, 5).map((harvest) => ({
          id: harvest.id,
          location: harvest.plantationId,
          metric: `${harvest.kgHarvested} kg panen`,
          status: harvest.status,
          href: `/panen/${harvest.id}`,
        })));
      } else if (isBuruh) {
        const harvests = await getMyHarvests();
        setMetrics([
          { label: "Riwayat Panen", value: String(harvests.length), href: "/panen" },
          { label: "Approved", value: String(harvests.filter((h) => h.status === "APPROVED").length), href: "/panen" },
          { label: "Pending", value: String(harvests.filter((h) => h.status === "PENDING").length), href: "/panen" },
        ]);
        setActivities(harvests.slice(0, 5).map((harvest) => ({
          id: harvest.id,
          location: harvest.plantationId,
          metric: `${harvest.kgHarvested} kg panen`,
          status: harvest.status,
          href: `/panen/${harvest.id}`,
        })));
      } else if (isSupir) {
        const shipments = await getActivePengirimanSupir();
        setMetrics([
          { label: "Pengiriman Aktif", value: String(shipments.length), href: "/pengiriman" },
          { label: "Memuat", value: String(shipments.filter((s) => s.status === "MEMUAT").length), href: "/pengiriman" },
          { label: "Mengirim", value: String(shipments.filter((s) => s.status === "MENGIRIM").length), href: "/pengiriman" },
        ]);
        setActivities(shipments.slice(0, 5).map((shipment) => ({
          id: shipment.id,
          location: shipment.kebun_id,
          metric: `${shipment.total_kg} kg pengiriman`,
          status: shipment.status,
          href: `/pengiriman/${shipment.id}`,
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dashboard");
      setMetrics([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome to Palmery</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {user?.name ? `How can we help you today, ${user.name}?` : "Data operasional tersambung ke backend lokal."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { title: "Manajemen Kebun", href: "/kebun", roles: ["ADMIN", "MANDOR"] },
            { title: "Hasil Panen", href: "/panen", roles: ["MANDOR", "BURUH"] },
            { title: "Pengiriman", href: "/pengiriman", roles: ["ADMIN", "MANDOR", "SUPIR"] },
          ].filter((item) => !role || item.roles.includes(role)).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl border border-[var(--color-border)] p-6 hover:shadow-sm transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Buka workflow dan simpan perubahan ke service backend.
              </p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric) => (
            <Link
              key={metric.label}
              href={metric.href}
              className="bg-white rounded-xl border border-[var(--color-border)] p-5 hover:shadow-sm transition-shadow"
            >
              <p className="text-sm text-[var(--color-text-muted)]">{metric.label}</p>
              <p className="text-3xl font-bold mt-1">{metric.value}</p>
            </Link>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <button onClick={loadDashboard} className="text-sm text-[var(--color-primary)] font-medium hover:underline">
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            {loading ? (
              <div className="py-12 text-center text-[var(--color-text-muted)]">Loading...</div>
            ) : activities.length === 0 ? (
              <div className="py-12 text-center text-[var(--color-text-muted)]">Belum ada aktivitas backend untuk role ini.</div>
            ) : (
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
                  {activities.map((activity) => (
                    <tr key={activity.id} className="border-b border-[var(--color-border-light)] last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">#{activity.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{activity.location.slice(0, 12)}</td>
                      <td className="px-4 py-3">{activity.metric}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {activity.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={activity.href} className="text-[var(--color-primary)] hover:underline">
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
