import mongoose from "mongoose";

const { Schema } = mongoose;

/** A single weekly availability slot. */
const AvailabilitySchema = new Schema(
  {
    day: {
      type: String,
      enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      required: true,
    },
    from: { type: String, required: true }, // "16:00"
    to: { type: String, required: true }, // "19:00"
  },
  { _id: false }
);

const TeacherProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    nativeEnglish: { type: Boolean, default: false },
    // Work/tax status in Israel, e.g. "Atzma'it" (self-employed), "Employee", "Student"...
    taxStatus: {
      type: String,
      enum: ["atzmait", "employee", "student", "other"],
      default: "other",
    },
    neighborhoods: [{ type: String, trim: true }], // areas the tutor covers
    subjects: [{ type: String, enum: ["english", "math", "combined"] }],
    formats: [{ type: String, enum: ["in_person", "online"] }],

    cvPath: { type: String }, // stored file path (served via /api/files)
    cvOriginalName: { type: String },

    availability: [AvailabilitySchema],

    // Default hourly pay rate assigned by Rachel; per-session rate can override.
    payRate: { type: Number, default: 0 },

    bio: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.TeacherProfile ||
  mongoose.model("TeacherProfile", TeacherProfileSchema);
