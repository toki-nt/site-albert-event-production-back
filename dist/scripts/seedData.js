"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = __importStar(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const Service_1 = __importDefault(require("../models/Service"));
const User_1 = __importDefault(require("../models/User"));
dotenv.config();
const seedServices = async () => {
    const services = [
        {
            title: "Accompagnement Personnalisé",
            description: "Service complet d'accompagnement pour rencontres internationales",
            price: 150,
            currency: "EUR",
            category: "rencontre",
            duration: "3 mois",
            features: [
                "Traduction et interprétation",
                "Conseils culturels",
                "Support administratif",
                "Mise en relation vérifiée",
            ],
            isActive: true,
        },
        {
            title: "Production Musicale",
            description: "Production professionnelle de musique en studio",
            price: 300,
            currency: "EUR",
            category: "artistique",
            duration: "Par projet",
            features: [
                "Enregistrement studio",
                "Mixage et mastering",
                "Arrangement musical",
                "Session avec musiciens",
            ],
            isActive: true,
        },
        {
            title: "Support Administratif",
            description: "Aide pour les démarches administratives",
            price: 75,
            currency: "EUR",
            category: "accompagnement",
            duration: "À la demande",
            features: [
                "Aide aux visas",
                "Traduction de documents",
                "Accompagnement physique",
                "Conseils juridiques",
            ],
            isActive: true,
        },
    ];
    await Service_1.default.deleteMany({});
    await Service_1.default.insertMany(services);
    console.log("✅ Services seeded successfully");
};
const seedAdminUser = async () => {
    const adminExists = await User_1.default.findOne({ email: "admin@aeproduction.com" });
    if (!adminExists) {
        const adminUser = new User_1.default({
            firstName: "Admin",
            lastName: "AE Production",
            email: "admin@aeproduction.com",
            password: "admin123",
            userType: "malagasy",
            profileCompleted: true,
        });
        await adminUser.save();
        console.log("✅ Admin user created successfully");
    }
};
const seedData = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ae-production";
        await mongoose.connect(MONGODB_URI);
        console.log("🌱 Seeding data...");
        await seedServices();
        await seedAdminUser();
        console.log("✅ All data seeded successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
};
seedData();
