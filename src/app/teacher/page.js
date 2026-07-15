"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ils, formatDate, subjectLabel } from "@/lib/constants";

export default function TeacherDashboard() {
  const [earnings, setEarnings] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/teacher/earnings").then((r) => r.json()),
      fetch("/api/teacher/sessions").then((r) => r.json()),
    ])
      .then(([e, s]) => {
        setEarnings(e);
        setSessions(s.sessions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-royal-700/60">Loading…</p>;

  const upcoming = sessions
    .filter((s) => new Date(s.startsAt) >= new Date() && s.status !== "cancelled")
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-royal">Welcome back</h1>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card label="This month" value={ils(earnings?.monthEarnings)} accent />
        <Card label="Pending payout" value={ils(earnings?.pending)} />
        <Card label="Paid to date" value={ils(earnings?.paid)} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-royal/50">
            Upcoming classes
          </h2>
          <Link href="/teacher/calendar" className="text-sm font-medium text-crimson hover:underline">
            View calendar →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="card text-center text-royal-700/60">No upcoming classes.</div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div key={s.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-royal">
                    {s.studentName} · {subjectLabel(s.subject)}
                  </p>
                  <p className="text-sm text-royal-700/60">
                    {formatDate(s.startsAt)} · {s.durationHours}h ·{" "}
                    {s.deliveryFormat === "online" ? "Online" : "In-person"}
                  </p>
                </div>
                <span className="badge bg-royal-50 text-royal">
                  {s.deliveryFormat === "online" ? "🔗 Zoom" : `📍 ${s.address || "In-person"}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ label, value, accent }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-card ${accent ? "border-crimson/20 bg-crimson/5" : "border-royal/10 bg-white"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-royal/50">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ? "text-crimson" : "text-royal"}`}>{value}</p>
    </div>
  );
}
