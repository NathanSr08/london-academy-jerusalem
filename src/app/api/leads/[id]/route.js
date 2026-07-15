import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Lead from "@/models/Lead";
import { guard } from "@/lib/apiAuth";

export const runtime = "nodejs";

const ALLOWED = ["new", "contacted", "booked", "archived"];

/** PATCH — admin: change lead status. */
export async function PATCH(req, { params }) {
  const { response } = await guard("admin");
  if (response) return response;

  const body = await req.json();
  if (body.status && !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await dbConnect();
  const lead = await Lead.findByIdAndUpdate(
    params.id,
    { $set: { ...(body.status ? { status: body.status } : {}) } },
    { new: true }
  ).lean();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

/** DELETE — admin: remove a lead. */
export async function DELETE(_req, { params }) {
  const { response } = await guard("admin");
  if (response) return response;
  await dbConnect();
  await Lead.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
