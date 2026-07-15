import Link from "next/link";
import QuoteForm from "@/components/QuoteForm";
import { pricingTable } from "@/lib/pricing";
import { ils } from "@/lib/constants";

export default function HomePage() {
  const table = pricingTable();

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-royal/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal font-serif text-lg font-bold text-white">
              LA
            </div>
            <div className="leading-tight">
              <p className="font-serif text-lg font-bold text-royal">London Academy</p>
              <p className="text-xs tracking-wide text-crimson">JERUSALEM</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <a href="#pricing" className="hidden text-sm font-medium text-royal-700 hover:text-royal sm:block">
              Pricing
            </a>
            <Link href="/apply" className="hidden text-sm font-medium text-royal-700 hover:text-royal sm:block">
              Teach with us
            </Link>
            <Link href="/login" className="btn-outline">
              Portal login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero + form */}
      <section className="bg-gradient-to-b from-royal to-royal-700 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="badge w-fit bg-crimson text-white">British excellence · Ages 4–10</span>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Elite English &amp; Mathematics tutoring in Jerusalem
            </h1>
            <p className="mt-4 max-w-lg text-white/80">
              Boutique, one-to-one and small-group lessons with native English
              teachers — in your home or online. Build your child&apos;s confidence,
              fluency and love of learning.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#quote" className="btn-crimson">Get an instant quote</a>
              <a href="#pricing" className="btn border border-white/40 text-white hover:bg-white/10">
                See pricing
              </a>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 text-center">
              <Stat value="4–10" label="Ages" />
              <Stat value="1-on-1" label="& small groups" />
              <Stat value="In-person / Online" label="Formats" />
            </dl>
          </div>

          <div id="quote" className="text-royal-700">
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-royal">Transparent pricing</h2>
          <p className="mt-2 text-royal-700/70">
            Per hour, per child. Private lessons or small groups.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {table.map((row) => (
            <div key={row.band} className="card">
              <h3 className="font-serif text-xl font-bold text-royal">{row.label}</h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-royal-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-royal/60">
                    Private (1-on-1)
                  </p>
                  <p className="mt-1 text-2xl font-bold text-royal">
                    {ils(row.private.parentPricePerChildPerHour)}
                    <span className="text-sm font-normal text-royal/60"> / hour</span>
                  </p>
                </div>
                <div className="rounded-xl border border-crimson/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-crimson/70">
                    Group ({row.group.groupMin}–{row.group.groupMax} kids)
                  </p>
                  <p className="mt-1 text-2xl font-bold text-crimson">
                    {ils(row.group.parentPricePerChildPerHour)}
                    <span className="text-sm font-normal text-crimson/60"> / child / hour</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Teacher CTA */}
      <section className="bg-royal-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-12 sm:flex-row">
          <div>
            <h2 className="font-serif text-2xl font-bold text-royal">Are you a teacher?</h2>
            <p className="mt-1 text-royal-700/70">
              Join our roster of tutors. Manage your schedule and earnings in your own
              secure portal.
            </p>
          </div>
          <Link href="/apply" className="btn-primary">
            Apply to teach
          </Link>
        </div>
      </section>

      <footer className="border-t border-royal/10">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-royal-700/60">
          © {new Date().getFullYear()} London Academy Jerusalem. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <dt className="text-lg font-bold">{value}</dt>
      <dd className="text-xs text-white/70">{label}</dd>
    </div>
  );
}
