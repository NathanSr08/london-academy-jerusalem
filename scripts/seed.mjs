/**
 * Optional demo-data seeder.
 *   Local:   MONGODB_URI=mongodb://localhost:27017/london_academy node scripts/seed.mjs
 *   Docker:  docker compose exec web node scripts/seed.mjs
 *
 * The Super-Admin is already auto-created on first boot from ADMIN_* env vars;
 * this script adds a demo teacher + demo lead so the portals are populated.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/london_academy";

const User = mongoose.model(
  "User",
  new mongoose.Schema({}, { strict: false, timestamps: true, collection: "users" })
);
const TeacherProfile = mongoose.model(
  "TeacherProfile",
  new mongoose.Schema({}, { strict: false, timestamps: true, collection: "teacherprofiles" })
);
const Lead = mongoose.model(
  "Lead",
  new mongoose.Schema({}, { strict: false, timestamps: true, collection: "leads" })
);

async function main() {
  await mongoose.connect(URI);
  console.log("Connected to", URI);

  const email = "teacher@londonacademy.co.il";
  let teacher = await User.findOne({ email });
  if (!teacher) {
    const passwordHash = await bcrypt.hash("Teacher123!", 12);
    teacher = await User.create({
      name: "Emma Watson",
      email,
      passwordHash,
      role: "tutor",
      phone: "+972 50 000 0000",
      status: "active",
    });
    await TeacherProfile.create({
      user: teacher._id,
      nativeEnglish: true,
      taxStatus: "atzmait",
      neighborhoods: ["Baka", "Katamon"],
      subjects: ["english", "combined"],
      formats: ["in_person", "online"],
      payRate: 120,
      availability: [
        { day: "sunday", from: "16:00", to: "19:00" },
        { day: "tuesday", from: "16:00", to: "19:00" },
      ],
      bio: "CELTA-certified native English teacher, 8 years with young learners.",
    });
    console.log("Created demo teacher:", email, "/ Teacher123!");
  } else {
    console.log("Demo teacher already exists.");
  }

  const leadCount = await Lead.countDocuments();
  if (leadCount === 0) {
    await Lead.create({
      parentName: "David Levi",
      email: "david@example.com",
      phone: "+972 52 111 2222",
      whatsapp: true,
      neighborhood: "German Colony",
      children: [{ firstName: "Noa", age: 7, subject: "english" }],
      format: "in_person",
      notes: "Wants to build reading confidence before school year.",
      status: "new",
    });
    console.log("Created demo lead.");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
