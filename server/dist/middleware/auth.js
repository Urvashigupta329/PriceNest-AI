"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const apiErrors_1 = require("../utils/apiErrors");
function parseBearer(req) {
    const auth = req.headers.authorization;
    if (!auth)
        return null;
    const [scheme, token] = auth.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token)
        return null;
    return token;
}
function requireAuth(req, _res, next) {
    const token = parseBearer(req);
    if (!token)
        return next(new apiErrors_1.ApiError(401, "Missing Authorization Bearer token"));
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = { id: payload.sub, role: payload.role };
        return next();
    }
    catch (_e) {
        return next(new apiErrors_1.ApiError(401, "Invalid or expired token"));
    }
}
function requireAdmin(req, res, next) {
    if (!req.user)
        return next(new apiErrors_1.ApiError(401, "Not authenticated"));
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
    }
    return next();
}
