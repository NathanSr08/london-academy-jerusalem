import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, signToken, cookieOptions, COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
      "+passwordHash"
    );
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (user.status === "suspended") {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }
    if (user.status === "pending") {
      return NextResponse.json(
        { error: "Your application is pending approval by the administrator." },
        { status: 403 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const res = NextResponse.json({
      user: user.toSafeJSON(),
      redirect: user.role === "admin" ? "/admin" : "/teacher",
    });
    res.cookies.set(COOKIE_NAME, token, cookieOptions());
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
