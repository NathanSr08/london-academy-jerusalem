import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Lead from "@/models/Lead";
import { guard } from "@/lib/apiAuth";
import { sendMail, alertRecipient } from "@/lib/mailer";

export const runtime = "nodejs";

/** POST — public lead submission from the multi-step quote form. */
export async function POST(req) {
  try {
    const body = await req.json();

    const children = Array.isArray(body.children)
      ? body.children
          .filter((c) => c && c.firstName)
          .map((c) => ({
            firstName: String(c.firstName).trim(),
            age: Number(c.age),
            subject: c.subject,
          }))
      : [];

    if (!body.parentName || !body.email || !body.phone || !body.neighborhood) {
      return NextResponse.json({ error: "Missing required parent fields" }, { status: 400 });
    }
    if (children.length === 0) {
      return NextResponse.json({ error: "Add at least one child" }, { status: 400 });
    }

    await dbConnect();
    const lead = await Lead.create({
      parentName: String(body.parentName).trim(),
      email: String(body.email).toLowerCase().trim(),
      phone: String(body.phone).trim(),
      whatsapp: Boolean(body.whatsapp),
      neighborhood: String(body.neighborhood).trim(),
      children,
      format: body.format === "online" ? "online" : "in_person",
      notes: body.notes ? String(body.notes).trim() : "",
    });

    // Instant alert to Rachel (best-effort).
    sendMail({
      to: alertRecipient(),
      subject: `New lead — ${lead.parentName} (${lead.neighborhood})`,
      text: `${lead.parentName} requested tutoring for ${children.length} child(ren). Phone: ${lead.phone}`,
      html: `<h3>New tutoring request</h3>
             <p><strong>${lead.parentName}</strong> — ${lead.email} — ${lead.phone}</p>
             <p>Neighborhood: ${lead.neighborhood} · Format: ${lead.format}</p>
             <p>Children: ${children.map((c) => `${c.firstName} (${c.age}, ${c.subject})`).join(", ")}</p>`,
    });

    return NextResponse.json({ ok: true, id: lead._id.toString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to submit request" }, { status: 500 });
  }
}

/** GET — admin: list leads, optional ?status= filter. */
export async function GET(req) {
  const { user, response } = await guard("admin");
  if (response) return response;

  await dbConnect();
  const status = new URL(req.url).searchParams.get("status");
  const query = status ? { status } : {};
  const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ leads });
}
