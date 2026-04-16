"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictSchema = void 0;
exports.predictPrice = predictPrice;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const apiErrors_1 = require("../utils/apiErrors");
exports.predictSchema = zod_1.z.object({
    location: zod_1.z.string().trim().min(2).max(80),
    area: zod_1.z.number().min(1),
    bedrooms: zod_1.z.number().min(0),
    bathrooms: zod_1.z.number().min(0)
});
async function predictPrice(input) {
    const url = `${env_1.env.ML_API_BASE_URL}${env_1.env.ML_API_PREDICT_ENDPOINT}`;
    console.log(`[PREDICTION] Sending request to ML API: ${url}`);
    console.log(`[PREDICTION] Payload:`, JSON.stringify(input));
    try {
        const resp = await axios_1.default.post(url, input, {
            timeout: 20000,
            headers: { "Content-Type": "application/json" }
        });
        console.log(`[PREDICTION] ML API response:`, JSON.stringify(resp.data));
        const data = resp.data;
        const predicted = data.predicted_price ?? data.predictedPrice;
        const confidenceScore = data.confidenceScore ?? data.confidence_score ?? 0.85;
        if (typeof predicted !== "number" || !Number.isFinite(predicted)) {
            console.error(`[PREDICTION] Invalid prediction value:`, predicted);
            throw new apiErrors_1.ApiError(502, "ML API returned invalid prediction data", data);
        }
        const result = { predictedPrice: predicted, confidenceScore: Math.min(1, Math.max(0, confidenceScore)) };
        console.log(`[PREDICTION] Success:`, result);
        return result;
    }
    catch (e) {
        const axiosError = e;
        const errorDetails = {
            message: e?.message,
            code: axiosError?.code,
            status: axiosError?.response?.status,
            data: axiosError?.response?.data
        };
        console.error(`[PREDICTION] Failed to reach ML API at ${url}:`, errorDetails);
        if (axiosError?.code === "ECONNREFUSED") {
            throw new apiErrors_1.ApiError(503, "Prediction engine unavailable. Ensure ML service is running on port 5001.", errorDetails);
        }
        else if (axiosError?.code === "ETIMEDOUT" || axiosError?.code === "ECONNABORTED") {
            throw new apiErrors_1.ApiError(504, "ML prediction request timed out. Service may be overloaded.", errorDetails);
        }
        throw new apiErrors_1.ApiError(502, `ML API error: ${axiosError?.response?.status || "Unknown"} - Check ML service health`, errorDetails);
    }
}
