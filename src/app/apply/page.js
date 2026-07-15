"use client";

import { useState } from "react";
import Link from "next/link";
import { DAYS, NEIGHBORHOODS } from "@/lib/constants";

export default function ApplyPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState([]);

  function toggleDay(day) {
    setAvailability((a) => {
      const exists = a.find((s) => s.day === day);
      if (exists) return a.filter((s) => s.day !== day);
      return [...a, { day, from: "16:00", to: "19:00" }];
    });
  }
  function setSlot(day, patch) {
    setAvailability((a) => a.map((s) => (s.day === day ? { ...s, ...patch } : s)));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    // Collect multi-selects into JSON arrays.
    fd.set("subjects", JSON.stringify(fd.getAll("subjects")));
    fd.set("formats", JSON.stringify(fd.getAll("formats")));
    fd.set("neighborhoods", JSON.stringify(fd.getAll("neighborhoods")));
    fd.set("availability", JSON.stringify(availability));

    try {
      const res = await fetch("/api/auth/register-teacher", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Shell>
        <div className="card mx-auto max-w-lg text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-royal-50 text-3xl">
            ✅
          </div>
          <h1 className="text-xl font-bold text-royal">Application received</h1>
          <p className="mt-2 text-royal-700/70">
            Thank you. Rachel will review your profile and CV. You will be able to log
            in once your account is approved.
          </p>
          <Link href="/" className="btn-primary mt-6 inline-flex">
            Back to home
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <form onSubmit={onSubmit} className="card mx-auto max-w-2xl" encType="multipart/form-data">
        <h1 className="text-2xl font-bold text-royal">Teacher application</h1>
        <p className="mt-1 text-sm text-royal-700/60">
          Create your secure tutor account. Fields marked * are required.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-2 text-sm text-crimson-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name *"><input name="name" className="input" required /></Field>
          <Field label="Email *"><input name="email" type="email" className="input" required /></Field>
          <Field label="Phone"><input name="phone" className="input" /></Field>
          <Field label="Password * (min 8 chars)">
            <input name="password" type="password" minLength={8} className="input" required />
          </Field>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Native English speaker?">
            <select name="nativeEnglish" className="input">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
          <Field label="Work / tax status in Israel">
            <select name="taxStatus" className="input">
              <option value="atzmait">Atzma&apos;it (self-employed)</option>
              <option value="employee">Employee</option>
              <option value="student">Student</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label="Subjects">
            <CheckList name="subjects" options={[["english","English"],["math","Mathematics"],["combined","Combined"]]} />
          </Field>
          <Field label="Formats">
            <CheckList name="formats" options={[["in_person","In-person"],["online","Online"]]} />
          </Field>
          <Field label="Neighborhoods covered">
            <select name="neighborhoods" multiple className="input h-28">
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <label className="label">Weekly availability</label>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const slot = availability.find((s) => s.day === day);
              return (
                <div key={day} className="flex items-center gap-3">
                  <label className="flex w-32 items-center gap-2 text-sm capitalize text-royal-700">
                    <input type="checkbox" checked={!!slot} onChange={() => toggleDay(day)} />
                    {day}
                  </label>
                  {slot && (
                    <div className="flex items-center gap-2 text-sm">
                      <input
                        type="time"
                        className="input py-1"
                        value={slot.from}
                        onChange={(e) => setSlot(day, { from: e.target.value })}
                      />
                      <span>to</span>
                      <input
                        type="time"
                        className="input py-1"
                        value={slot.to}
                        onChange={(e) => setSlot(day, { to: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="CV (PDF, max 5 MB)">
            <input name="cv" type="file" accept="application/pdf" className="input" />
          </Field>
          <Field label="Short bio">
            <input name="bio" className="input" placeholder="Experience, qualifications…" />
          </Field>
        </div>

        <button type="submit" className="btn-crimson mt-8 w-full" disabled={loading}>
          {loading ? "Submitting…" : "Submit application"}
        </button>
        <p className="mt-3 text-center text-sm text-royal-700/60">
          Already approved?{" "}
          <Link href="/login" className="font-semibold text-royal hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <main className="min-h-screen bg-royal-50 py-10">
      <div className="mx-auto mb-6 max-w-2xl px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal font-serif text-white">LA</div>
          <span className="font-serif text-lg font-bold text-royal">London Academy Jerusalem</span>
        </Link>
      </div>
      <div className="px-4">{children}</div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function CheckList({ name, options }) {
  return (
    <div className="space-y-1">
      {options.map(([value, label]) => (
        <label key={value} className="flex items-center gap-2 text-sm text-royal-700">
          <input type="checkbox" name={name} value={value} />
          {label}
        </label>
      ))}
    </div>
  );
}
