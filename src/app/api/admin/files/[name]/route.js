import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { guard } from "@/lib/apiAuth";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";

/** GET — admin only: stream an uploaded CV (PDF). */
export async function GET(_req, { params }) {
  const { response } = await guard("admin");
  if (response) return response;

  // Prevent path traversal — only a bare filename is allowed.
  const name = path.basename(params.name || "");
  if (!name || name.includes("..")) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const filePath = path.join(UPLOAD_DIR, name);
    const data = await fs.readFile(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${name}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
