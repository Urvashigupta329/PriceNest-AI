"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
class AnalyticsController {
    static async trend(req, res) {
        const { location, months } = req.query;
        const data = await (0, analytics_service_1.getTrend)(location, months ?? 12);
        return res.json({ trend: data });
    }
}
exports.AnalyticsController = AnalyticsController;
