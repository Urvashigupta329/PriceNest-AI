"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const mongoose_1 = require("./config/mongoose");
async function main() {
    try {
        // Connect to MongoDB
        await (0, mongoose_1.connectMongo)();
        console.log("✅ MongoDB connected");
        // Create Express app
        const app = (0, app_1.createServer)();
        // Health check endpoints
        app.get("/", (req, res) => {
            res.json({ status: "ok", message: "PriceNestAI backend running" });
        });
        app.get("/health", (req, res) => {
            res.json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                environment: env_1.env.NODE_ENV,
                services: {
                    database: "connected",
                    api: "ready"
                }
            });
        });
        // Start server
        const server = app.listen(env_1.env.PORT, () => {
            console.log(`\n🚀 PriceNestAI Backend`);
            console.log(`📍 Running on http://localhost:${env_1.env.PORT}`);
            console.log(`📤 ML API at: ${env_1.env.ML_API_BASE_URL}${env_1.env.ML_API_PREDICT_ENDPOINT}`);
            console.log(`🔐 Environment: ${env_1.env.NODE_ENV}\n`);
        });
        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("SIGTERM received, shutting down gracefully...");
            server.close(() => {
                console.log("Server closed");
                process.exit(0);
            });
        });
    }
    catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
}
// Start application
main();
