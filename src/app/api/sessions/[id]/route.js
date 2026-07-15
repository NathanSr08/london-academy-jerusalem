import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ClassSession from "@/models/ClassSession";
import { guard } from "@/lib/apiAuth";

export const runtime = "nodejs";

/** PATCH — admin: update session/payout status. */
export async function PATCH(req, { params }) {
  const { response } = await guard("admin");
  if (response) return response;

  const b = await req.json();
  const update = {};
  if (b.status && ["scheduled", "completed", "cancelled"].includes(b.status)) {
    update.status = b.status;
  }
  if (b.payoutStatus && ["pending", "paid"].includes(b.payoutStatus)) {
    update.payoutStatus = b.payoutStatus;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await dbConnect();
  const session = await ClassSession.findByIdAndUpdate(
    params.id,
    { $set: update },
    { new: true }
  ).lean();
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ session });
}

/** DELETE — admin: cancel/remove a session. */
export async function DELETE(_req, { params }) {
  const { response } = await guard("admin");
  if (response) return response;
  await dbConnect();
  await ClassSession.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
