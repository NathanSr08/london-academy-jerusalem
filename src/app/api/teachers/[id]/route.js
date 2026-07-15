import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import TeacherProfile from "@/models/TeacherProfile";
import { guard } from "@/lib/apiAuth";

export const runtime = "nodejs";

/**
 * PATCH — admin: approve/suspend a teacher and/or set their default pay rate.
 * Body: { status?: "active"|"pending"|"suspended", payRate?: number }
 */
export async function PATCH(req, { params }) {
  const { response } = await guard("admin");
  if (response) return response;

  const body = await req.json();
  await dbConnect();

  if (body.status) {
    if (!["active", "pending", "suspended"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await User.findByIdAndUpdate(params.id, { $set: { status: body.status } });
  }

  if (body.payRate !== undefined) {
    const rate = Number(body.payRate);
    if (Number.isNaN(rate) || rate < 0) {
      return NextResponse.json({ error: "Invalid pay rate" }, { status: 400 });
    }
    await TeacherProfile.findOneAndUpdate(
      { user: params.id },
      { $set: { payRate: rate } },
      { upsert: true }
    );
  }

  const user = await User.findById(params.id).lean();
  const profile = await TeacherProfile.findOne({ user: params.id }).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    teacher: { id: user._id.toString(), name: user.name, status: user.status, profile },
  });
}
