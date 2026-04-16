"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const apiErrors_1 = require("../utils/apiErrors");
function errorHandler(err, _req, res, _next) {
    const anyErr = err;
    if (anyErr instanceof apiErrors_1.ApiError) {
        return res
            .status(anyErr.statusCode)
            .json({ error: anyErr.message, details: anyErr.details });
    }
    // Mongoose / casting issues often land here
    return res.status(500).json({
        error: "Internal server error",
        details: anyErr.message
    });
}
