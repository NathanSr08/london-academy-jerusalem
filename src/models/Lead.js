import mongoose from "mongoose";

const { Schema } = mongoose;

const ChildSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 4, max: 10 },
    subject: {
      type: String,
      enum: ["english", "math", "combined"],
      required: true,
    },
  },
  { _id: false }
);

/**
 * Incoming acquisition request from the public multi-step form.
 */
const LeadSchema = new Schema(
  {
    // Step 1 — Parent
    parentName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: Boolean, default: false },
    neighborhood: { type: String, required: true, trim: true },

    // Step 2 — Children (dynamic array)
    children: {
      type: [ChildSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, "At least one child is required"],
    },

    // Step 3 — Logistics
    format: { type: String, enum: ["in_person", "online"], required: true },
    notes: { type: String, trim: true },

    status: {
      type: String,
      enum: ["new", "contacted", "booked", "archived"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
