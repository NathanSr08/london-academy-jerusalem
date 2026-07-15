import { NextResponse } from "next/server";
import { computePricing, pricingTable, ageToBand } from "@/lib/pricing";

export const runtime = "nodejs";

/** GET — return the full pricing matrix (for public display). */
export async function GET() {
  return NextResponse.json({ table: pricingTable() });
}

/**
 * POST — compute an instant quote for a set of children.
 * Body: { children: [{ age, subject }], format: "private"|"group", hours }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const children = Array.isArray(body.children) ? body.children : [];
    const format = body.format === "group" ? "group" : "private";
    const hours = Number(body.hours) || 1;

    if (children.length === 0) {
      return NextResponse.json({ error: "At least one child is required" }, { status: 400 });
    }

    const lines = [];
    let totalGross = 0;

    if (format === "group") {
      // Group quote: price children of the same band together.
      const byBand = {};
      for (const c of children) {
        const band = ageToBand(c.age);
        if (!band) continue;
        byBand[band] = (byBand[band] || 0) + 1;
      }
      for (const [band, count] of Object.entries(byBand)) {
        const p = computePricing({ age: band, format: "group", numChildren: count, hours });
        lines.push({ band, count, ...p });
        totalGross += p.grossRevenue;
      }
    } else {
      for (const c of children) {
        const band = ageToBand(c.age);
        if (!band) continue;
        const p = computePricing({ age: band, format: "private", hours });
        lines.push({ band, count: 1, subject: c.subject, ...p });
        totalGross += p.grossRevenue;
      }
    }

    return NextResponse.json({
      format,
      hours,
      lines,
      totalGrossPerSession: Math.round(totalGross * 100) / 100,
    });
  } catch {
    return NextResponse.json({ error: "Unable to compute quote" }, { status: 400 });
  }
}
