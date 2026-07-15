import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ClassSession from "@/models/ClassSession";
import { guard } from "@/lib/apiAuth";

export const runtime = "nodejs";

/**
 * GET — tutor: personal earnings & payout dashboard.
 * Returns per-session pay, current-month cumulative earnings and payout history.
 */
export async function GET() {
  const { user, response } = await guard("tutor");
  if (response) return response;

  await dbConnect();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const sessions = await ClassSession.find({
    teacher: user.sub,
    status: { $ne: "cancelled" },
  })
    .sort({ startsAt: -1 })
    .lean();

  let monthEarnings = 0;
  let pending = 0;
  let paid = 0;
  for (const s of sessions) {
    if (new Date(s.startsAt) >= monthStart) monthEarnings += s.teacherPayout;
    if (s.payoutStatus === "paid") paid += s.teacherPayout;
    else pending += s.teacherPayout;
  }

  return NextResponse.json({
    monthEarnings: round2(monthEarnings),
    pending: round2(pending),
    paid: round2(paid),
    totalSessions: sessions.length,
    sessions: sessions.map((s) => ({
      id: s._id.toString(),
      studentName: s.studentName,
      subject: s.subject,
      startsAt: s.startsAt,
      durationHours: s.durationHours,
      teacherPayPerHour: s.teacherPayPerHour,
      teacherPayout: s.teacherPayout,
      payoutStatus: s.payoutStatus,
      status: s.status,
    })),
  });
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
