import { createServer } from "./app";
import { env } from "./config/env";
import { connectMongo } from "./config/mongoose";

async function main() {
  try {
    // Connect to MongoDB
    await connectMongo();
    console.log("MongoDB connected ✅");

    // Create Express app
    const app = createServer();

    // Optional: Health check route (fixes 404 on "/")
    app.get("/", (req, res) => {
      res.send("Server is running successfully 🚀");
    });

    // Start server
    app.listen(env.PORT, () => {
      console.log(`Server listening on http://localhost:${env.PORT}`);
    });

  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// Start application
main();
