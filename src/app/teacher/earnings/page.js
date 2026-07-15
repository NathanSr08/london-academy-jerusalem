"use client";

import { useEffect, useState } from "react";
import { ils, formatDate, subjectLabel } from "@/lib/constants";

export default function EarningsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/earnings")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-royal-700/60">Loading…</p>;
  if (!data) return <p className="text-crimson">Unable to load earnings.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-royal">Earnings &amp; payouts</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="This month" value={ils(data.monthEarnings)} accent />
        <Card label="Pending" value={ils(data.pending)} />
        <Card label="Paid" value={ils(data.paid)} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-royal/10 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-royal/10 text-left text-royal/50">
              <th className="p-3">Date</th>
              <th className="p-3">Student</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Rate</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Pay</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-royal-700/50">
                  No sessions yet.
                </td>
              </tr>
            )}
            {data.sessions.map((s) => (
              <tr key={s.id} className="border-b border-royal/5">
                <td className="p-3">{formatDate(s.startsAt)}</td>
                <td className="p-3 font-medium text-royal">{s.studentName}</td>
                <td className="p-3">{subjectLabel(s.subject)}</td>
                <td className="p-3">{ils(s.teacherPayPerHour)}/h</td>
                <td className="p-3">{s.durationHours}h</td>
                <td className="p-3 font-semibold">{ils(s.teacherPayout)}</td>
                <td className="p-3">
                  <span
                    className={`badge ${
                      s.payoutStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {s.payoutStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
