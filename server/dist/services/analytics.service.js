"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsQuerySchema = void 0;
exports.getTrend = getTrend;
const zod_1 = require("zod");
const property_service_1 = require("./property.service");
exports.analyticsQuerySchema = zod_1.z.object({
    location: zod_1.z.string().trim().min(2).max(80),
    months: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : 12))
        .refine((n) => Number.isFinite(n) && n > 0 && n <= 60, {
        message: "months must be between 1 and 60"
    })
        .optional()
});
async function getTrend(location, months = 12) {
    return (0, property_service_1.getPropertyHistoryTrend)(location, months);
}
