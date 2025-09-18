"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const galleryRoutes_1 = __importDefault(require("./routes/galleryRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5005;
// const PORT = 5005;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connexion à MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ae-production";
mongoose_1.default
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
// Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/services", serviceRoutes_1.default);
app.use("/api/gallery", galleryRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/messages", messageRoutes_1.default);
app.use("/api/profiles", profileRoutes_1.default);
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
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});
// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
module.exports = app;
