"use client";

import { useEffect, useState } from "react";
import { ils, formatDate } from "@/lib/constants";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await (await fetch("/api/teachers")).json();
    setTeachers(data.teachers || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function patch(id, body) {
    await fetch(`/api/teachers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  if (loading) return <p className="text-royal-700/60">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-royal">Teacher directory &amp; approvals</h1>

      {teachers.length === 0 && (
        <div className="card text-center text-royal-700/60">No teachers yet.</div>
      )}

      <div className="space-y-4">
        {teachers.map((t) => (
          <TeacherCard key={t.id} teacher={t} onPatch={patch} />
        ))}
      </div>
    </div>
  );
}

function TeacherCard({ teacher, onPatch }) {
  const [rate, setRate] = useState(teacher.profile?.payRate || "");
  const p = teacher.profile;

  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-royal">{teacher.name}</h3>
            <StatusBadge status={teacher.status} />
            {p?.nativeEnglish && <span className="badge bg-royal-50 text-royal">Native EN</span>}
          </div>
          <p className="mt-1 text-sm text-royal-700/70">
            {teacher.email} · {teacher.phone || "no phone"}
          </p>
          <p className="mt-1 text-xs text-royal-700/50">Applied {formatDate(teacher.createdAt)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {teacher.status === "pending" && (
            <button className="btn-primary" onClick={() => onPatch(teacher.id, { status: "active" })}>
              Approve
            </button>
          )}
          {teacher.status === "active" && (
            <button className="btn-outline" onClick={() => onPatch(teacher.id, { status: "suspended" })}>
              Suspend
            </button>
          )}
          {teacher.status === "suspended" && (
            <button className="btn-primary" onClick={() => onPatch(teacher.id, { status: "active" })}>
              Reactivate
            </button>
          )}
        </div>
      </div>

      {p && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {(p.subjects || []).map((s) => (
            <span key={s} className="badge bg-royal-50 text-royal capitalize">{s}</span>
          ))}
          {(p.formats || []).map((f) => (
            <span key={f} className="badge bg-crimson/10 text-crimson">{f.replace("_", "-")}</span>
          ))}
          {(p.neighborhoods || []).map((n) => (
            <span key={n} className="badge bg-gray-100 text-gray-600">{n}</span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-royal/10 pt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-royal-700/70">Pay rate (ILS/h):</label>
          <input
            className="input w-28"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <button className="btn-outline" onClick={() => onPatch(teacher.id, { payRate: Number(rate) })}>
            Save
          </button>
          {p?.payRate ? (
            <span className="text-sm text-royal-700/60">Current: {ils(p.payRate)}</span>
          ) : null}
        </div>

        {p?.cvPath && (
          <a
            href={`/api/admin/files/${p.cvPath}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-crimson hover:underline"
          >
            📄 View CV
          </a>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const style =
    status === "active"
      ? "bg-green-100 text-green-700"
      : status === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-gray-200 text-gray-600";
  return <span className={`badge capitalize ${style}`}>{status}</span>;
}
