import { z } from "zod";
import axios from "axios";
import { env } from "../config/env";
import { ApiError } from "../utils/apiErrors";

export const predictSchema = z.object({
  location: z.string().trim().min(2).max(80),
  area: z.number().min(1),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0)
});

export async function predictPrice(input: z.infer<typeof predictSchema>) {
  const url = `${env.ML_API_BASE_URL}${env.ML_API_PREDICT_ENDPOINT}`;
  try {
    const resp = await axios.post(url, input, { timeout: 15000 });
    const data = resp.data as { predicted_price?: number; predictedPrice?: number };
    const predicted = data.predicted_price ?? data.predictedPrice;
    if (typeof predicted !== "number" || !Number.isFinite(predicted)) {
      throw new ApiError(502, "ML API returned an invalid prediction payload", data);
    }
    return { predictedPrice: predicted };
  } catch (e: any) {
    const details = e?.response?.data ?? e?.message;
    throw new ApiError(502, "Failed to reach ML API", details);
  }
}

