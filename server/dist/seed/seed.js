"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("../config/mongoose");
const env_1 = require("../config/env");
const user_model_1 = require("../models/user.model");
const property_model_1 = require("../models/property.model");
const sampleProperties_1 = require("./sampleProperties");
async function seed() {
    await (0, mongoose_1.connectMongo)();
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pricenest.ai";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
    const existingAdmin = await user_model_1.UserModel.findOne({ email: adminEmail.toLowerCase() });
    if (!existingAdmin) {
        const passwordHash = await bcryptjs_1.default.hash(adminPassword, 10);
        await user_model_1.UserModel.create({
            name: "Admin",
            email: adminEmail,
            passwordHash,
            role: "admin"
        });
        // eslint-disable-next-line no-console
        console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
    }
    else {
        // eslint-disable-next-line no-console
        console.log(`Admin user exists: ${adminEmail}`);
    }
    const reset = (process.env.SEED_RESET ?? "").toLowerCase() === "true";
    if (reset) {
        await property_model_1.PropertyModel.deleteMany({});
    }
    let inserted = 0;
    for (const p of sampleProperties_1.sampleProperties) {
        const key = { location: p.location, area: p.area, bedrooms: p.bedrooms, bathrooms: p.bathrooms };
        const existing = await property_model_1.PropertyModel.findOne(key);
        if (existing)
            continue;
        await property_model_1.PropertyModel.create({
            ...p,
            ...key
        });
        inserted += 1;
    }
    // eslint-disable-next-line no-console
    console.log(`Seed complete. Properties inserted: ${inserted}`);
    // eslint-disable-next-line no-console
    console.log(`Tip: Start server with npm run dev, port ${env_1.env.PORT}`);
}
seed()
    .then(() => process.exit(0))
    .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", err);
    process.exit(1);
});
