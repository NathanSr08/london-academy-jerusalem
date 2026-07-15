"use client";

import { useEffect, useState } from "react";
import { ils } from "@/lib/constants";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-royal-700/60">Loading dashboard…</p>;
  if (!stats) return <p className="text-crimson">Unable to load statistics.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-royal">Financial dashboard</h1>
        <p className="text-royal-700/60">Gross revenue, teacher payouts and your net commission.</p>
      </div>

      {/* This month */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-royal/50">
          This month
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Gross revenue" value={ils(stats.thisMonth.gross)} tone="royal" />
          <StatCard label="Teacher payouts" value={ils(stats.thisMonth.payout)} tone="muted" />
          <StatCard label="Net margin (commission)" value={ils(stats.thisMonth.margin)} tone="crimson" />
        </div>
      </section>

      {/* All-time + ops */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-royal/50">
          All-time
        </h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Gross revenue" value={ils(stats.allTime.gross)} tone="royal" />
          <StatCard label="Teacher payouts" value={ils(stats.allTime.payout)} tone="muted" />
          <StatCard label="Net margin" value={ils(stats.allTime.margin)} tone="crimson" />
          <StatCard label="Total sessions" value={stats.allTime.count} tone="muted" />
        </div>
      </section>

      {/* Ops counters */}
      <section className="grid gap-4 sm:grid-cols-4">
        <MiniCard label="New leads" value={stats.leadsByStatus?.new || 0} />
        <MiniCard label="Booked leads" value={stats.leadsByStatus?.booked || 0} />
        <MiniCard label="Active teachers" value={stats.activeTeachers} />
        <MiniCard label="Pending approvals" value={stats.pendingTeachers} highlight={stats.pendingTeachers > 0} />
      </section>

      {/* Monthly breakdown */}
      <section className="card">
        <h2 className="mb-4 font-bold text-royal">Last 6 months</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-royal/10 text-left text-royal/50">
                <th className="py-2">Month</th>
                <th className="py-2">Sessions</th>
                <th className="py-2">Gross</th>
                <th className="py-2">Payouts</th>
                <th className="py-2">Net margin</th>
              </tr>
            </thead>
            <tbody>
              {stats.byMonth.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-royal-700/50">
                    No sessions recorded yet.
                  </td>
                </tr>
              )}
              {stats.byMonth.map((m) => (
                <tr key={`${m.year}-${m.month}`} className="border-b border-royal/5">
                  <td className="py-2 font-medium text-royal">{MONTHS[m.month]} {m.year}</td>
                  <td className="py-2">{m.count}</td>
                  <td className="py-2">{ils(m.gross)}</td>
                  <td className="py-2">{ils(m.payout)}</td>
                  <td className="py-2 font-semibold text-crimson">{ils(m.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const toneClass =
    tone === "crimson"
      ? "border-crimson/20 bg-crimson/5"
      : tone === "royal"
      ? "border-royal/15 bg-royal-50"
      : "border-royal/10 bg-white";
  const valueClass = tone === "crimson" ? "text-crimson" : "text-royal";
  return (
    <div className={`rounded-2xl border p-5 shadow-card ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-royal/50">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function MiniCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-crimson/40 bg-crimson/5" : "border-royal/10 bg-white"}`}>
      <p className="text-2xl font-bold text-royal">{value}</p>
      <p className="text-xs text-royal-700/60">{label}</p>
    </div>
  );
}
