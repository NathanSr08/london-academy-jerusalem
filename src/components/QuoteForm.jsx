"use client";

import { useState } from "react";
import { NEIGHBORHOODS, SUBJECTS, AGES, FORMATS, ils } from "@/lib/constants";

const emptyChild = () => ({ firstName: "", age: 6, subject: "english" });

export default function QuoteForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState(null);

  const [form, setForm] = useState({
    parentName: "",
    email: "",
    phone: "",
    whatsapp: true,
    neighborhood: NEIGHBORHOODS[0],
    children: [emptyChild()],
    format: "in_person",
    notes: "",
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const setChild = (i, patch) =>
    setForm((f) => ({
      ...f,
      children: f.children.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));

  const addChild = () => set({ children: [...form.children, emptyChild()] });
  const removeChild = (i) =>
    set({ children: form.children.filter((_, idx) => idx !== i) });

  const validateStep1 = () => {
    if (!form.parentName.trim()) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (form.phone.trim().length < 6) return "Please enter a valid phone number.";
    return "";
  };
  const validateStep2 = () => {
    if (form.children.length === 0) return "Add at least one child.";
    for (const c of form.children) {
      if (!c.firstName.trim()) return "Each child needs a first name.";
    }
    return "";
  };

  async function next() {
    setError("");
    if (step === 1) {
      const e = validateStep1();
      if (e) return setError(e);
    }
    if (step === 2) {
      const e = validateStep2();
      if (e) return setError(e);
      // Fetch an indicative quote before showing step 3.
      await fetchQuote();
    }
    setStep((s) => Math.min(3, s + 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function fetchQuote() {
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          children: form.children.map((c) => ({ age: c.age, subject: c.subject })),
          format: "private",
          hours: 1,
        }),
      });
      const data = await res.json();
      if (res.ok) setQuote(data);
    } catch {
      /* quote is optional */
    }
  }

  async function submit() {
    setError("");
    const e = validateStep2();
    if (e) return setError(e);
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-royal-50 text-3xl">
          🎓
        </div>
        <h3 className="text-xl font-bold text-royal">Thank you!</h3>
        <p className="mt-2 text-royal-700/80">
          Your request has been received. Rachel will contact you shortly to arrange
          your first lesson.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <Stepper step={step} />

      {error && (
        <div className="mb-4 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-2 text-sm text-crimson-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-royal">Step 1 — Your details</h3>
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              value={form.parentName}
              onChange={(e) => set({ parentName: e.target.value })}
              placeholder="Sarah Cohen"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => set({ phone: e.target.value })}
                placeholder="+972 5X XXX XXXX"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-royal-700">
            <input
              type="checkbox"
              checked={form.whatsapp}
              onChange={(e) => set({ whatsapp: e.target.checked })}
            />
            This number is reachable on WhatsApp
          </label>
          <div>
            <label className="label">Jerusalem neighborhood</label>
            <select
              className="input"
              value={form.neighborhood}
              onChange={(e) => set({ neighborhood: e.target.value })}
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-royal">Step 2 — Your children</h3>
          {form.children.map((c, i) => (
            <div key={i} className="rounded-xl border border-royal/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-royal">Child {i + 1}</span>
                {form.children.length > 1 && (
                  <button
                    type="button"
                    className="text-xs font-medium text-crimson hover:underline"
                    onClick={() => removeChild(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">First name</label>
                  <input
                    className="input"
                    value={c.firstName}
                    onChange={(e) => setChild(i, { firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Age</label>
                  <select
                    className="input"
                    value={c.age}
                    onChange={(e) => setChild(i, { age: Number(e.target.value) })}
                  >
                    {AGES.map((a) => (
                      <option key={a} value={a}>
                        {a} years
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <select
                    className="input"
                    value={c.subject}
                    onChange={(e) => setChild(i, { subject: e.target.value })}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn-outline" onClick={addChild}>
            + Add another child
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-royal">Step 3 — Preferences</h3>
          <div>
            <label className="label">Learning format</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {FORMATS.map((f) => (
                <label
                  key={f.value}
                  className={`cursor-pointer rounded-xl border p-4 text-sm ${
                    form.format === f.value
                      ? "border-royal bg-royal-50 font-semibold text-royal"
                      : "border-royal/15 text-royal-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    className="mr-2"
                    checked={form.format === f.value}
                    onChange={() => set({ format: f.value })}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">
              Special learning needs / academic objectives (optional)
            </label>
            <textarea
              className="input min-h-[100px]"
              value={form.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="e.g. preparing for entrance exam, mild dyslexia, wants to build confidence in reading…"
            />
          </div>

          {quote && (
            <div className="rounded-xl border border-royal/10 bg-royal-50 p-4 text-sm">
              <p className="font-semibold text-royal">Indicative price (per hour)</p>
              <p className="mt-1 text-royal-700/80">
                Private 1-on-1 total:{" "}
                <span className="font-bold text-royal">
                  {ils(quote.totalGrossPerSession)}
                </span>{" "}
                / hour for {form.children.length} child(ren). Final quote confirmed on
                contact.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        {step > 1 ? (
          <button type="button" className="btn-outline" onClick={back}>
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button type="button" className="btn-primary" onClick={next}>
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="btn-crimson"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Get my quote"}
          </button>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const steps = ["Details", "Children", "Preferences"];
  return (
    <div className="mb-6 flex items-center gap-2">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n <= step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-bold ${
                active ? "bg-royal text-white" : "bg-royal-50 text-royal/50"
              }`}
            >
              {n}
            </div>
            <span
              className={`hidden text-xs font-medium sm:block ${
                active ? "text-royal" : "text-royal/40"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${active && step > n ? "bg-royal" : "bg-royal-50"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
