import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ClassSession from "@/models/ClassSession";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { guard } from "@/lib/apiAuth";
import { computePricing } from "@/lib/pricing";

export const runtime = "nodejs";

/** GET — admin: list all class sessions. */
export async function GET() {
  const { response } = await guard("admin");
  if (response) return response;

  await dbConnect();
  const sessions = await ClassSession.find()
    .populate("teacher", "name email")
    .sort({ startsAt: -1 })
    .lean();
  return NextResponse.json({ sessions });
}

/**
 * POST — admin: matchmaking. Create a class session linking a teacher to a
 * student. Financials are computed from the Pricing Matrix and snapshotted.
 *
 * Body: {
 *   teacherId, leadId?, studentName, studentAge, subject,
 *   format: "private"|"group", numChildren?, deliveryFormat,
 *   address?, visioLink?, startsAt, durationHours?,
 *   teacherPayOverride?  // per-hour override, else uses profile/matrix
 * }
 */
export async function POST(req) {
  const { response } = await guard("admin");
  if (response) return response;

  try {
    const b = await req.json();
    if (!b.teacherId || !b.studentName || !b.studentAge || !b.subject || !b.startsAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const teacher = await User.findOne({ _id: b.teacherId, role: "tutor" });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const format = b.format === "group" ? "group" : "private";
    const hours = Number(b.durationHours) || 1;
    const numChildren = format === "group" ? Number(b.numChildren) || 3 : 1;

    // Base financials from the matrix (snapshot).
    const pricing = computePricing({
      age: Number(b.studentAge),
      format,
      numChildren,
      hours,
    });

    // Optional per-session teacher pay override (per hour).
    let teacherPayPerHour = pricing.teacherPayPerHour;
    if (b.teacherPayOverride !== undefined && b.teacherPayOverride !== "") {
      const override = Number(b.teacherPayOverride);
      if (!Number.isNaN(override) && override >= 0) teacherPayPerHour = override;
    }
    const teacherPayout = round2(teacherPayPerHour * hours);
    const netMargin = round2(pricing.grossRevenue - teacherPayout);

    const session = await ClassSession.create({
      lead: b.leadId || undefined,
      teacher: teacher._id,
      studentName: String(b.studentName).trim(),
      studentAge: Number(b.studentAge),
      subject: b.subject,
      format,
      numChildren,
      deliveryFormat: b.deliveryFormat === "online" ? "online" : "in_person",
      address: b.address || "",
      visioLink: b.visioLink || "",
      startsAt: new Date(b.startsAt),
      durationHours: hours,
      parentPricePerChildPerHour: pricing.parentPricePerChildPerHour,
      teacherPayPerHour,
      grossRevenue: pricing.grossRevenue,
      teacherPayout,
      netMargin,
    });

    // Mark the originating lead as booked.
    if (b.leadId) {
      await Lead.findByIdAndUpdate(b.leadId, { $set: { status: "booked" } });
    }

    return NextResponse.json({ ok: true, session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create session" }, { status: 500 });
  }
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
