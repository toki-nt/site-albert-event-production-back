// import { Request, Response } from "express";

// const testHandler = (req: Request, res: Response) => {
//   res.json({ message: "Hello from test.ts!" });
// };

// export default testHandler;
require.extensions[".ts"] = function (module, filename) {
  const fs = require("fs");
  const content = fs.readFileSync(filename, "utf8");
  // Vous pouvez ajouter une transpilation TypeScript ici si nécessaire
  module._compile(content, filename);
};
import * as express from "express";
import * as cors from "cors";
import * as dotenv from "dotenv";
import * as mongoose from "mongoose";
import userRoutes from "./src/routes/userRoutes.ts";
import authRoutes from "./src/routes/authRoutes.ts";
import serviceRoutes from "./src/routes/serviceRoutes.ts";
import galleryRoutes from "./src/routes/galleryRoutes.ts";
import paymentRoutes from "./src/routes/paymentRoutes.ts";
import messageRoutes from "./src/routes/messageRoutes.ts";
import profileRoutes from "./src/routes/profileRoutes.ts";

// Import corrigé - soit supprimez accompanimentRoutes, soit créez le fichier
// Pour l'instant, supprimons l'import qui cause l'erreur

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ae-production";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err: Error) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/profiles", profileRoutes);

// Route de santé
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Route d'accueil
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API AE Production",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      services: "/api/services",
      gallery: "/api/gallery",
      payments: "/api/payments",
      messages: "/api/messages",
      profiles: "/api/profiles",
      health: "/api/health",
    },
  });
});

// Gestion des erreurs 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Middleware de gestion d'erreurs global
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
