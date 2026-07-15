import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ClassSession from "@/models/ClassSession";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { guard } from "@/lib/apiAuth";

export const runtime = "nodejs";

/**
 * GET — admin: financial + operational dashboard.
 * Aggregates Gross Revenue, Teacher Payouts (COGS) and Net Margin.
 */
export async function GET() {
  const { response } = await guard("admin");
  if (response) return response;

  await dbConnect();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totals, monthTotals, byMonth, leadCounts, teacherCount, pendingTeachers] =
    await Promise.all([
      aggregateFinancials({ status: { $ne: "cancelled" } }),
      aggregateFinancials({ status: { $ne: "cancelled" }, startsAt: { $gte: monthStart } }),
      ClassSession.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: { y: { $year: "$startsAt" }, m: { $month: "$startsAt" } },
            gross: { $sum: "$grossRevenue" },
            payout: { $sum: "$teacherPayout" },
            margin: { $sum: "$netMargin" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": -1, "_id.m": -1 } },
        { $limit: 6 },
      ]),
      Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.countDocuments({ role: "tutor", status: "active" }),
      User.countDocuments({ role: "tutor", status: "pending" }),
    ]);

  const leadsByStatus = Object.fromEntries(leadCounts.map((l) => [l._id, l.count]));

  return NextResponse.json({
    allTime: totals,
    thisMonth: monthTotals,
    byMonth: byMonth.map((r) => ({
      year: r._id.y,
      month: r._id.m,
      gross: r.gross,
      payout: r.payout,
      margin: r.margin,
      count: r.count,
    })),
    leadsByStatus,
    activeTeachers: teacherCount,
    pendingTeachers,
  });
}

async function aggregateFinancials(match) {
  const [row] = await ClassSession.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        gross: { $sum: "$grossRevenue" },
        payout: { $sum: "$teacherPayout" },
        margin: { $sum: "$netMargin" },
        count: { $sum: 1 },
      },
    },
  ]);
  return { gross: row?.gross || 0, payout: row?.payout || 0, margin: row?.margin || 0, count: row?.count || 0 };
}
