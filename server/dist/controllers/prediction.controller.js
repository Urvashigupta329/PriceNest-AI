"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionController = void 0;
const prediction_service_1 = require("../services/prediction.service");
class PredictionController {
    static async predict(req, res) {
        console.log("[CONTROLLER] POST /api/predict received");
        console.log("[CONTROLLER] Input payload:", JSON.stringify(req.body));
        try {
            const result = await (0, prediction_service_1.predictPrice)(req.body);
            console.log("[CONTROLLER] Prediction successful, sending result:", result);
            return res.json(result);
        }
        catch (error) {
            console.error("[CONTROLLER] Prediction failed:", error);
            throw error; // Let error handler catch it
        }
    }
}
exports.PredictionController = PredictionController;
