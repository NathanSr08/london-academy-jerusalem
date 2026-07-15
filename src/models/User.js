import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Unified account for both Super-Admin (Rachel) and Teachers.
 * Teacher-specific data lives in TeacherProfile (1-1).
 */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "tutor"],
      default: "tutor",
      index: true,
    },
    phone: { type: String, trim: true },
    status: {
      type: String,
      // tutors start as "pending" until Rachel approves them
      enum: ["pending", "active", "suspended"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

UserSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    status: this.status,
    createdAt: this.createdAt,
  };
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
