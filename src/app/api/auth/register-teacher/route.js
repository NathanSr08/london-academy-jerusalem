import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import TeacherProfile from "@/models/TeacherProfile";
import { hashPassword } from "@/lib/auth";
import { sendMail, alertRecipient } from "@/lib/mailer";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Teacher application / sign-up (public).
 * Accepts multipart/form-data so the CV (PDF) can be uploaded in one request.
 */
export async function POST(req) {
  try {
    const form = await req.formData();

    const name = str(form.get("name"));
    const email = str(form.get("email")).toLowerCase();
    const phone = str(form.get("phone"));
    const password = str(form.get("password"));

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await dbConnect();
    if (await User.findOne({ email })) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // ---- Optional CV upload (PDF) ----
    let cvPath, cvOriginalName;
    const cv = form.get("cv");
    if (cv && typeof cv === "object" && cv.size > 0) {
      if (cv.type !== "application/pdf") {
        return NextResponse.json({ error: "CV must be a PDF file" }, { status: 400 });
      }
      if (cv.size > MAX_CV_BYTES) {
        return NextResponse.json({ error: "CV exceeds the 5 MB limit" }, { status: 400 });
      }
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const safe = `${randomUUID()}.pdf`;
      const buffer = Buffer.from(await cv.arrayBuffer());
      await fs.writeFile(path.join(UPLOAD_DIR, safe), buffer);
      cvPath = safe;
      cvOriginalName = cv.name || "cv.pdf";
    }

    // ---- Create pending user + profile ----
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: "tutor",
      status: "pending", // must be approved by Rachel before login
    });

    await TeacherProfile.create({
      user: user._id,
      nativeEnglish: str(form.get("nativeEnglish")) === "true",
      taxStatus: str(form.get("taxStatus")) || "other",
      neighborhoods: parseList(form.get("neighborhoods")),
      subjects: parseList(form.get("subjects")),
      formats: parseList(form.get("formats")),
      availability: parseJSON(form.get("availability"), []),
      bio: str(form.get("bio")),
      cvPath,
      cvOriginalName,
    });

    // Notify the administrator (best-effort).
    sendMail({
      to: alertRecipient(),
      subject: `New teacher application — ${name}`,
      text: `${name} (${email}, ${phone}) applied to teach. Review in the admin portal.`,
      html: `<p><strong>${name}</strong> (${email}, ${phone}) applied to teach.</p><p>Review in the admin portal.</p>`,
    });

    return NextResponse.json(
      { ok: true, message: "Application received. You will be notified once approved." },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}
function parseList(v) {
  const s = str(v);
  if (!s) return [];
  try {
    const j = JSON.parse(s);
    if (Array.isArray(j)) return j;
  } catch {
    /* comma separated fallback */
  }
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}
function parseJSON(v, fallback) {
  try {
    return JSON.parse(str(v));
  } catch {
    return fallback;
  }
}
