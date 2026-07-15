import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ClassSession from "@/models/ClassSession";
import { guard } from "@/lib/apiAuth";

export const runtime = "nodejs";

/** GET — tutor: own confirmed sessions (calendar + student cards). */
export async function GET() {
  const { user, response } = await guard("tutor");
  if (response) return response;

  await dbConnect();
  const sessions = await ClassSession.find({ teacher: user.sub })
    .sort({ startsAt: 1 })
    .lean();

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s._id.toString(),
      studentName: s.studentName,
      studentAge: s.studentAge,
      subject: s.subject,
      format: s.format,
      deliveryFormat: s.deliveryFormat,
      address: s.address,
      visioLink: s.visioLink,
      startsAt: s.startsAt,
      durationHours: s.durationHours,
      status: s.status,
    })),
  });
}
