"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
const apiErrors_1 = require("../utils/apiErrors");
function validateBody(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            return next(new apiErrors_1.ApiError(400, "Invalid request body", parsed.error.flatten()));
        }
        req.body = parsed.data;
        return next();
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.query);
        if (!parsed.success) {
            return next(new apiErrors_1.ApiError(400, "Invalid query parameters", parsed.error.flatten()));
        }
        req.query = parsed.data;
        return next();
    };
}
