"use client";

import { useEffect, useState } from "react";
import { subjectLabel, formatDate } from "@/lib/constants";

export default function StudentsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-royal-700/60">Loading…</p>;

  // Build one card per unique student, aggregating their lesson history.
  const map = new Map();
  for (const s of sessions) {
    const key = `${s.studentName}-${s.studentAge}`;
    if (!map.has(key)) {
      map.set(key, {
        studentName: s.studentName,
        studentAge: s.studentAge,
        subject: s.subject,
        deliveryFormat: s.deliveryFormat,
        address: s.address,
        visioLink: s.visioLink,
        lessons: [],
      });
    }
    map.get(key).lessons.push(s);
  }
  const students = [...map.values()];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-royal">My students</h1>
      {students.length === 0 ? (
        <div className="card text-center text-royal-700/60">No students assigned yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {students.map((st, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-royal">{st.studentName}</h2>
                <span className="badge bg-royal-50 text-royal">{st.studentAge} years</span>
              </div>
              <p className="mt-1 text-sm text-royal-700/70">
                Subject: {subjectLabel(st.subject)}
              </p>
              <p className="mt-1 text-sm text-royal-700/70">
                {st.deliveryFormat === "online" ? (
                  <>🔗 {st.visioLink || "Online session"}</>
                ) : (
                  <>📍 {st.address || "In-person"}</>
                )}
              </p>

              <div className="mt-4 border-t border-royal/10 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-royal/50">
                  Lesson history ({st.lessons.length})
                </p>
                <ul className="space-y-1 text-sm text-royal-700/70">
                  {st.lessons
                    .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt))
                    .slice(0, 6)
                    .map((l) => (
                      <li key={l.id} className="flex justify-between">
                        <span>{formatDate(l.startsAt)}</span>
                        <span className="capitalize text-royal/50">{l.status}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
