"use client";

import { useEffect, useState } from "react";
import { subjectLabel, formatDate } from "@/lib/constants";

const STATUSES = ["new", "contacted", "booked", "archived"];
const STATUS_STYLE = {
  new: "bg-royal-50 text-royal",
  contacted: "bg-amber-100 text-amber-700",
  booked: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const url = filter ? `/api/leads?status=${filter}` : "/api/leads";
    const data = await (await fetch(url)).json();
    setLeads(data.leads || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setStatus(id, status) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-royal">Leads</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("")}
            className={`badge ${!filter ? "bg-royal text-white" : "bg-royal-50 text-royal"}`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`badge capitalize ${filter === s ? "bg-royal text-white" : "bg-royal-50 text-royal"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-royal-700/60">Loading…</p>
      ) : leads.length === 0 ? (
        <div className="card text-center text-royal-700/60">No leads found.</div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead._id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-royal">{lead.parentName}</h3>
                    <span className={`badge capitalize ${STATUS_STYLE[lead.status]}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-royal-700/70">
                    {lead.email} · {lead.phone}
                    {lead.whatsapp && " · 📱 WhatsApp"} · {lead.neighborhood}
                  </p>
                  <p className="mt-1 text-xs text-royal-700/50">{formatDate(lead.createdAt)}</p>
                </div>
                <select
                  className="input w-40"
                  value={lead.status}
                  onChange={(e) => setStatus(lead._id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {lead.children.map((c, i) => (
                  <span key={i} className="badge bg-royal-50 text-royal">
                    {c.firstName}, {c.age}y · {subjectLabel(c.subject)}
                  </span>
                ))}
                <span className="badge bg-crimson/10 text-crimson">
                  {lead.format === "online" ? "Online" : "In-person"}
                </span>
              </div>

              {lead.notes && (
                <p className="mt-3 rounded-lg bg-royal-50 p-3 text-sm text-royal-700/80">
                  “{lead.notes}”
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
