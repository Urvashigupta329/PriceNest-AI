import { createServer } from "./app";
import { env } from "./config/env";
import { connectMongo } from "./config/mongoose";

async function main() {
  try {
    // Connect to MongoDB
    await connectMongo();
    console.log("✅ MongoDB connected");

    // Create Express app
    const app = createServer();

    // Health check endpoints
    app.get("/", (req, res) => {
      res.json({ status: "ok", message: "PriceNestAI backend running" });
    });
    
    app.get("/health", (req, res) => {
      res.json({ 
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        services: {
          database: "connected",
          api: "ready"
        }
      });
    });

    // Start server
    const server = app.listen(env.PORT, () => {
      console.log(`\n🚀 PriceNestAI Backend`);
      console.log(`📍 Running on http://localhost:${env.PORT}`);
      console.log(`📤 ML API at: ${env.ML_API_BASE_URL}${env.ML_API_PREDICT_ENDPOINT}`);
      console.log(`🔐 Environment: ${env.NODE_ENV}\n`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

// Start application
main();
