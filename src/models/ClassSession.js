import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * A confirmed, scheduled class linking a teacher to a student (from a lead).
 * Financials are snapshotted at creation time from the Pricing Matrix so that
 * later matrix changes never rewrite historical earnings.
 */
const ClassSessionSchema = new Schema(
  {
    lead: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Student snapshot (from the lead's child)
    studentName: { type: String, required: true },
    studentAge: { type: Number, required: true, min: 4, max: 10 },
    subject: { type: String, enum: ["english", "math", "combined"], required: true },

    format: { type: String, enum: ["private", "group"], required: true },
    numChildren: { type: Number, default: 1 },
    deliveryFormat: { type: String, enum: ["in_person", "online"], default: "in_person" },

    // Location / link
    address: { type: String },
    visioLink: { type: String },

    // Scheduling
    startsAt: { type: Date, required: true, index: true },
    durationHours: { type: Number, default: 1 },

    // Financial snapshot (per session totals, in ILS)
    parentPricePerChildPerHour: { type: Number, required: true },
    teacherPayPerHour: { type: Number, required: true },
    grossRevenue: { type: Number, required: true },
    teacherPayout: { type: Number, required: true },
    netMargin: { type: Number, required: true },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true,
    },

    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ClassSession ||
  mongoose.model("ClassSession", ClassSessionSchema);
