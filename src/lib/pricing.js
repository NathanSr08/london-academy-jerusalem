/**
 * Pricing Matrix & Commission Logic (from the specification).
 *
 * All amounts are in ILS, per hour.
 *  - Private (1-on-1): parent pays a flat rate; teacher gets a flat rate.
 *  - Group: parent pays PER CHILD; teacher gets a single fixed rate for the group.
 *
 * Margin (Rachel's commission) = gross revenue - teacher payout.
 */

export const AGE_BANDS = [
  { key: "4-6", label: "Ages 4-6", min: 4, max: 6 },
  { key: "7-8", label: "Ages 7-8", min: 7, max: 8 },
  { key: "9-10", label: "Ages 9-10", min: 9, max: 10 },
];

export const FORMATS = [
  { key: "private", label: "Private (1-on-1)" },
  { key: "group", label: "Group" },
];

/**
 * Base matrix.
 *  parentPrice  -> charged per hour (private) OR per hour PER CHILD (group)
 *  teacherPay   -> fixed per hour
 *  groupMin/Max -> allowed group sizes (used to derive "up to" margins)
 */
export const PRICING_MATRIX = {
  "4-6": {
    private: { parentPrice: 150, teacherPay: 100 },
    group: { parentPrice: 70, teacherPay: 150, groupMin: 3, groupMax: 5 },
  },
  "7-8": {
    private: { parentPrice: 180, teacherPay: 120 },
    group: { parentPrice: 80, teacherPay: 160, groupMin: 3, groupMax: 5 },
  },
  "9-10": {
    private: { parentPrice: 200, teacherPay: 130 },
    group: { parentPrice: 90, teacherPay: 180, groupMin: 4, groupMax: 6 },
  },
};

/** Map an exact age (4..10) to a band key. */
export function ageToBand(age) {
  const n = Number(age);
  const band = AGE_BANDS.find((b) => n >= b.min && n <= b.max);
  return band ? band.key : null;
}

/**
 * Compute the full financials for a class/session.
 *
 * @param {Object} p
 * @param {number|string} p.age       - exact child age OR a band key ("4-6")
 * @param {"private"|"group"} p.format
 * @param {number} [p.numChildren=1]  - group size (ignored for private)
 * @param {number} [p.hours=1]        - session duration in hours
 * @returns {Object} breakdown
 */
export function computePricing({ age, format, numChildren = 1, hours = 1 }) {
  const band = PRICING_MATRIX[age] ? age : ageToBand(age);
  if (!band) throw new Error(`No pricing band for age "${age}"`);
  if (format !== "private" && format !== "group") {
    throw new Error(`Invalid format "${format}"`);
  }

  const row = PRICING_MATRIX[band][format];
  const h = Math.max(0.5, Number(hours) || 1);

  let children = format === "group" ? Math.max(1, Number(numChildren) || 1) : 1;
  if (format === "group") {
    children = Math.min(Math.max(children, row.groupMin), row.groupMax);
  }

  // Per-hour figures
  const grossPerHour = row.parentPrice * children;
  const teacherPerHour = row.teacherPay;
  const marginPerHour = grossPerHour - teacherPerHour;

  return {
    band,
    format,
    numChildren: children,
    hours: h,
    parentPricePerChildPerHour: row.parentPrice,
    teacherPayPerHour: teacherPerHour,
    // Totals for the whole session
    grossRevenue: round2(grossPerHour * h),
    teacherPayout: round2(teacherPerHour * h),
    netMargin: round2(marginPerHour * h),
    // Per-hour helpers
    grossPerHour: round2(grossPerHour),
    marginPerHour: round2(marginPerHour),
  };
}

/**
 * Full matrix for display, including the theoretical "up to" group margin
 * (largest allowed group size).
 */
export function pricingTable() {
  return AGE_BANDS.map((band) => {
    const priv = computePricing({ age: band.key, format: "private" });
    const groupRow = PRICING_MATRIX[band.key].group;
    const group = computePricing({
      age: band.key,
      format: "group",
      numChildren: groupRow.groupMax,
    });
    return {
      band: band.key,
      label: band.label,
      private: priv,
      group: { ...group, groupMin: groupRow.groupMin, groupMax: groupRow.groupMax },
    };
  });
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
