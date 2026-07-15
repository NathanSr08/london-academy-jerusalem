import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import TeacherProfile from "@/models/TeacherProfile";
import { guard } from "@/lib/apiAuth";

export const runtime = "nodejs";

/** GET — admin: list teachers (with profiles), optional ?status= filter. */
export async function GET(req) {
  const { response } = await guard("admin");
  if (response) return response;

  await dbConnect();
  const status = new URL(req.url).searchParams.get("status");
  const query = { role: "tutor", ...(status ? { status } : {}) };

  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  const profiles = await TeacherProfile.find({
    user: { $in: users.map((u) => u._id) },
  }).lean();

  const byUser = Object.fromEntries(profiles.map((p) => [p.user.toString(), p]));
  const teachers = users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone,
    status: u.status,
    createdAt: u.createdAt,
    profile: byUser[u._id.toString()] || null,
  }));

  return NextResponse.json({ teachers });
}
