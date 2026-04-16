import { z } from "zod";
import axios, { AxiosError } from "axios";
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
  
  console.log(`[PREDICTION] Sending request to ML API: ${url}`);
  console.log(`[PREDICTION] Payload:`, JSON.stringify(input));

  try {
    const resp = await axios.post(url, input, { 
      timeout: 20000,
      headers: { "Content-Type": "application/json" }
    });
    
    console.log(`[PREDICTION] ML API response:`, JSON.stringify(resp.data));
    
    const data = resp.data as {
      predicted_price?: number;
      predictedPrice?: number;
      confidenceScore?: number;
      confidence_score?: number;
    };
    
    const predicted = data.predicted_price ?? data.predictedPrice;
    const confidenceScore = data.confidenceScore ?? data.confidence_score ?? 0.85;

    if (typeof predicted !== "number" || !Number.isFinite(predicted)) {
      console.error(`[PREDICTION] Invalid prediction value:`, predicted);
      throw new ApiError(502, "ML API returned invalid prediction data", data);
    }
    
    const result = { predictedPrice: predicted, confidenceScore: Math.min(1, Math.max(0, confidenceScore)) };
    console.log(`[PREDICTION] Success:`, result);
    return result;
  } catch (e: any) {
    const axiosError = e as AxiosError;
    const errorDetails = {
      message: e?.message,
      code: axiosError?.code,
      status: axiosError?.response?.status,
      data: axiosError?.response?.data
    };
    
    console.error(`[PREDICTION] Failed to reach ML API at ${url}:`, errorDetails);
    
    if (axiosError?.code === "ECONNREFUSED") {
      throw new ApiError(503, "Prediction engine unavailable. Ensure ML service is running on port 5001.", errorDetails);
    } else if (axiosError?.code === "ETIMEDOUT" || axiosError?.code === "ECONNABORTED") {
      throw new ApiError(504, "ML prediction request timed out. Service may be overloaded.", errorDetails);
    }
    
    throw new ApiError(
      502,
      `ML API error: ${axiosError?.response?.status || "Unknown"} - Check ML service health`,
      errorDetails
    );
  }
}

