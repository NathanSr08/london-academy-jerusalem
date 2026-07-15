"use client";

import { useEffect, useMemo, useState } from "react";
import { ils, subjectLabel, formatDate } from "@/lib/constants";
import { computePricing } from "@/lib/pricing";

export default function SessionsPage() {
  const [teachers, setTeachers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [t, l, s] = await Promise.all([
      fetch("/api/teachers?status=active").then((r) => r.json()),
      fetch("/api/leads").then((r) => r.json()),
      fetch("/api/sessions").then((r) => r.json()),
    ]);
    setTeachers(t.teachers || []);
    setLeads((l.leads || []).filter((x) => x.status !== "archived"));
    setSessions(s.sessions || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function updateSession(id, body) {
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  if (loading) return <p className="text-royal-700/60">Loading…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-royal">Matchmaking engine</h1>

      <MatchForm teachers={teachers} leads={leads} onCreated={load} />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-royal/50">
          Scheduled classes
        </h2>
        {sessions.length === 0 ? (
          <div className="card text-center text-royal-700/60">No sessions yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-royal/10 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-royal/10 text-left text-royal/50">
                  <th className="p-3">When</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Teacher</th>
                  <th className="p-3">Gross</th>
                  <th className="p-3">Payout</th>
                  <th className="p-3">Margin</th>
                  <th className="p-3">Payout status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s._id} className="border-b border-royal/5">
                    <td className="p-3">{formatDate(s.startsAt)}</td>
                    <td className="p-3">
                      {s.studentName} <span className="text-royal/40">({s.studentAge}y)</span>
                    </td>
                    <td className="p-3">{s.teacher?.name || "—"}</td>
                    <td className="p-3">{ils(s.grossRevenue)}</td>
                    <td className="p-3">{ils(s.teacherPayout)}</td>
                    <td className="p-3 font-semibold text-crimson">{ils(s.netMargin)}</td>
                    <td className="p-3">
                      <select
                        className="input py-1"
                        value={s.payoutStatus}
                        onChange={(e) => updateSession(s._id, { payoutStatus: e.target.value })}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MatchForm({ teachers, leads, onCreated }) {
  const [form, setForm] = useState({
    leadId: "",
    childIndex: 0,
    teacherId: "",
    studentName: "",
    studentAge: 6,
    subject: "english",
    format: "private",
    numChildren: 1,
    deliveryFormat: "in_person",
    address: "",
    visioLink: "",
    startsAt: "",
    durationHours: 1,
    teacherPayOverride: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // When a lead is chosen, prefill the student from its selected child.
  function onLead(leadId) {
    const lead = leads.find((l) => l._id === leadId);
    if (!lead) return set({ leadId: "" });
    const child = lead.children[0];
    set({
      leadId,
      childIndex: 0,
      studentName: child?.firstName || "",
      studentAge: child?.age || 6,
      subject: child?.subject || "english",
      deliveryFormat: lead.format,
      address: lead.neighborhood,
    });
  }
  function onChild(idx) {
    const lead = leads.find((l) => l._id === form.leadId);
    const child = lead?.children[idx];
    if (child) {
      set({ childIndex: idx, studentName: child.firstName, studentAge: child.age, subject: child.subject });
    }
  }

  // Live pricing preview from the shared matrix.
  const preview = useMemo(() => {
    try {
      const p = computePricing({
        age: Number(form.studentAge),
        format: form.format,
        numChildren: Number(form.numChildren) || 1,
        hours: Number(form.durationHours) || 1,
      });
      let payout = p.teacherPayout;
      if (form.teacherPayOverride !== "") {
        payout = (Number(form.teacherPayOverride) || 0) * (Number(form.durationHours) || 1);
      }
      return { ...p, teacherPayout: payout, netMargin: p.grossRevenue - payout };
    } catch {
      return null;
    }
  }, [form]);

  const selectedLead = leads.find((l) => l._id === form.leadId);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.teacherId) return setError("Select a teacher.");
    if (!form.studentName) return setError("Student name required.");
    if (!form.startsAt) return setError("Pick a date and time.");
    setSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create session");
      onCreated();
      set({ startsAt: "", teacherPayOverride: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <h2 className="font-bold text-royal">Assign a class</h2>
      {error && (
        <div className="mt-3 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-2 text-sm text-crimson-700">
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">From lead (optional)</label>
          <select className="input" value={form.leadId} onChange={(e) => onLead(e.target.value)}>
            <option value="">— Manual entry —</option>
            {leads.map((l) => (
              <option key={l._id} value={l._id}>
                {l.parentName} · {l.neighborhood} ({l.children.length} child)
              </option>
            ))}
          </select>
        </div>

        {selectedLead && selectedLead.children.length > 1 && (
          <div>
            <label className="label">Which child</label>
            <select className="input" value={form.childIndex} onChange={(e) => onChild(Number(e.target.value))}>
              {selectedLead.children.map((c, i) => (
                <option key={i} value={i}>
                  {c.firstName} ({c.age}y, {subjectLabel(c.subject)})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label">Teacher *</label>
          <select className="input" value={form.teacherId} onChange={(e) => set({ teacherId: e.target.value })}>
            <option value="">— Select —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.profile?.payRate ? `(${t.profile.payRate} ILS/h)` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Student name *</label>
          <input className="input" value={form.studentName} onChange={(e) => set({ studentName: e.target.value })} />
        </div>

        <div>
          <label className="label">Age</label>
          <select className="input" value={form.studentAge} onChange={(e) => set({ studentAge: Number(e.target.value) })}>
            {[4, 5, 6, 7, 8, 9, 10].map((a) => (
              <option key={a} value={a}>{a} years</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Subject</label>
          <select className="input" value={form.subject} onChange={(e) => set({ subject: e.target.value })}>
            <option value="english">English</option>
            <option value="math">Mathematics</option>
            <option value="combined">Combined</option>
          </select>
        </div>

        <div>
          <label className="label">Format</label>
          <select className="input" value={form.format} onChange={(e) => set({ format: e.target.value })}>
            <option value="private">Private (1-on-1)</option>
            <option value="group">Group</option>
          </select>
        </div>

        {form.format === "group" && (
          <div>
            <label className="label"># children in group</label>
            <input
              className="input"
              type="number"
              min={2}
              value={form.numChildren}
              onChange={(e) => set({ numChildren: Number(e.target.value) })}
            />
          </div>
        )}

        <div>
          <label className="label">Delivery</label>
          <select className="input" value={form.deliveryFormat} onChange={(e) => set({ deliveryFormat: e.target.value })}>
            <option value="in_person">In-person</option>
            <option value="online">Online</option>
          </select>
        </div>

        <div>
          <label className="label">Date &amp; time *</label>
          <input
            className="input"
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => set({ startsAt: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Duration (hours)</label>
          <input
            className="input"
            type="number"
            step="0.5"
            min="0.5"
            value={form.durationHours}
            onChange={(e) => set({ durationHours: Number(e.target.value) })}
          />
        </div>

        {form.deliveryFormat === "in_person" ? (
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => set({ address: e.target.value })} />
          </div>
        ) : (
          <div>
            <label className="label">Visio link</label>
            <input className="input" value={form.visioLink} onChange={(e) => set({ visioLink: e.target.value })} />
          </div>
        )}

        <div>
          <label className="label">Teacher pay override (ILS/h)</label>
          <input
            className="input"
            type="number"
            placeholder="Leave blank = matrix rate"
            value={form.teacherPayOverride}
            onChange={(e) => set({ teacherPayOverride: e.target.value })}
          />
        </div>
      </div>

      {preview && (
        <div className="mt-4 grid gap-3 rounded-xl bg-royal-50 p-4 sm:grid-cols-3">
          <PreviewStat label="Gross revenue" value={ils(preview.grossRevenue)} />
          <PreviewStat label="Teacher payout" value={ils(preview.teacherPayout)} />
          <PreviewStat label="Your margin" value={ils(preview.netMargin)} accent />
        </div>
      )}

      <button type="submit" className="btn-crimson mt-6" disabled={saving}>
        {saving ? "Assigning…" : "Create session"}
      </button>
    </form>
  );
}

function PreviewStat({ label, value, accent }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-royal/50">{label}</p>
      <p className={`text-lg font-bold ${accent ? "text-crimson" : "text-royal"}`}>{value}</p>
    </div>
  );
}
