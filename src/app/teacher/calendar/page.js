"use client";

import { useEffect, useState } from "react";
import { subjectLabel } from "@/lib/constants";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function CalendarPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-royal-700/60">Loading…</p>;

  // Group by weekday for a simple weekly overview.
  const byDay = DAYS.map((_, i) =>
    sessions
      .filter((s) => s.status !== "cancelled" && new Date(s.startsAt).getDay() === i)
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-royal">Weekly calendar</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {DAYS.map((day, i) => (
          <div key={day} className="rounded-2xl border border-royal/10 bg-white p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-royal">{day}</h2>
            {byDay[i].length === 0 ? (
              <p className="text-xs text-royal-700/40">No classes</p>
            ) : (
              <div className="space-y-2">
                {byDay[i].map((s) => (
                  <div key={s.id} className="rounded-lg bg-royal-50 p-3 text-sm">
                    <p className="font-semibold text-royal">
                      {new Date(s.startsAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {s.studentName}
                    </p>
                    <p className="text-xs text-royal-700/60">
                      {subjectLabel(s.subject)} · {s.durationHours}h
                    </p>
                    <p className="mt-1 text-xs">
                      {s.deliveryFormat === "online" ? (
                        <span className="text-crimson">🔗 {s.visioLink || "Online"}</span>
                      ) : (
                        <span className="text-royal-700/70">📍 {s.address || "In-person"}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
