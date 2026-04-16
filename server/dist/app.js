"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const auth_routes_1 = require("./routes/auth.routes");
const property_routes_1 = require("./routes/property.routes");
const favorites_routes_1 = require("./routes/favorites.routes");
const prediction_routes_1 = require("./routes/prediction.routes");
const analytics_routes_1 = require("./routes/analytics.routes");
const errorHandler_1 = require("./middleware/errorHandler");
function createServer() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        // In development, the frontend may come up on a different port (5173/5174/etc).
        // Allow the request origin so browser requests don't fail with a generic "Authentication failed".
        origin: env_1.env.NODE_ENV === "development" ? true : env_1.env.CLIENT_ORIGIN,
        credentials: true
    }));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use((0, morgan_1.default)(env_1.env.NODE_ENV === "development" ? "dev" : "combined"));
    // Custom request logger
    app.use((req, res, next) => {
        console.log(`[SERVER] Incoming: ${req.method} ${req.path}`);
        res.on("finish", () => {
            console.log(`[SERVER] Response: ${req.method} ${req.path} -> ${res.statusCode}`);
        });
        next();
    });
    app.get("/", (req, res) => res.json({ status: "ok", message: "PriceNestAI backend running" }));
    app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
    app.use("/api/auth", auth_routes_1.authRoutes);
    app.use("/api/properties", property_routes_1.propertyRoutes);
    app.use("/api/favorites", favorites_routes_1.favoritesRoutes);
    app.use("/api/predict", prediction_routes_1.predictionRoutes);
    app.use("/api/analytics", analytics_routes_1.analyticsRoutes);
    app.use(errorHandler_1.errorHandler);
    return app;
}
