import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import TeacherProfile from "@/models/TeacherProfile";
import { guard } from "@/lib/apiAuth";

export const runtime = "nodejs";

/** GET — tutor: own profile. */
export async function GET() {
  const { user, response } = await guard("tutor");
  if (response) return response;

  await dbConnect();
  const me = await User.findById(user.sub).lean();
  const profile = await TeacherProfile.findOne({ user: user.sub }).lean();
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    user: { id: me._id.toString(), name: me.name, email: me.email, phone: me.phone },
    profile,
  });
}
