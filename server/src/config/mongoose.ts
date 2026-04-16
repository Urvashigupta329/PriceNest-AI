import mongoose from "mongoose";
import { env } from "./env";

export async function connectMongo() {
  const uri = env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}

