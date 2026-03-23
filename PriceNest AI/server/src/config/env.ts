import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? "development",

  MONGODB_URI: required("MONGODB_URI"),

  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  ML_API_BASE_URL: process.env.ML_API_BASE_URL ?? "http://localhost:5001",
  ML_API_PREDICT_ENDPOINT: process.env.ML_API_PREDICT_ENDPOINT ?? "/predict",

  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:5173"
};

