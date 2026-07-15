import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://db:27017/london_academy";

/**
 * Cache the connection across hot-reloads / serverless invocations so we don't
 * open a new pool on every request.
 */
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      })
      .then(async (m) => {
        // Ensure a Super-Admin exists so the platform is usable on first boot.
        await ensureAdmin();
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

/**
 * Idempotently create the bootstrap Super-Admin from environment variables.
 */
async function ensureAdmin() {
  // Imported lazily to avoid a circular import at module-load time.
  const { default: User } = await import("@/models/User");
  const bcrypt = (await import("bcryptjs")).default;

  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    name: process.env.ADMIN_NAME || "Super Admin",
    email,
    passwordHash,
    role: "admin",
    status: "active",
  });
  // eslint-disable-next-line no-console
  console.log(`[bootstrap] Super-Admin account created for ${email}`);
}
