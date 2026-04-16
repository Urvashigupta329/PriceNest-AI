import bcrypt from "bcryptjs";
import { connectMongo } from "../config/mongoose";
import { env } from "../config/env";
import { UserModel } from "../models/user.model";
import { PropertyModel } from "../models/property.model";
import { sampleProperties } from "./sampleProperties";

async function seed() {
  await connectMongo();

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pricenest.ai";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  const existingAdmin = await UserModel.findOne({ email: adminEmail.toLowerCase() });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await UserModel.create({
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "admin"
    });
    // eslint-disable-next-line no-console
    console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Admin user exists: ${adminEmail}`);
  }

  const reset = (process.env.SEED_RESET ?? "").toLowerCase() === "true";
  if (reset) {
    await PropertyModel.deleteMany({});
  }

  let inserted = 0;
  for (const p of sampleProperties) {
    const key = { location: p.location, area: p.area, bedrooms: p.bedrooms, bathrooms: p.bathrooms };
    const existing = await PropertyModel.findOne(key);
    if (existing) continue;
    await PropertyModel.create({
      ...p,
      ...key
    });
    inserted += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Seed complete. Properties inserted: ${inserted}`);

  // eslint-disable-next-line no-console
  console.log(`Tip: Start server with npm run dev, port ${env.PORT}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", err);
    process.exit(1);
  });

