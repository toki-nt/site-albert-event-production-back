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
const express = __importStar(require("express"));
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = express.Router();
// Register
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password, userType } = req.body;
        // Validation
        if (!firstName || !lastName || !email || !password || !userType) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({
                message: "Le mot de passe doit contenir au moins 6 caractères",
            });
        }
        if (!["malagasy", "foreigner"].includes(userType)) {
            return res.status(400).json({ message: "Type d'utilisateur invalide" });
        }
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Un utilisateur avec cet email existe déjà" });
        }
        // Créer un nouvel utilisateur
        const user = new User_1.default({
            firstName,
            lastName,
            email,
            password,
            userType,
        });
        await user.save();
        // Générer le token JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" });
        res.status(201).json({
            message: "Utilisateur créé avec succès",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                profileCompleted: user.profileCompleted,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: "Données invalides", errors });
        }
        if (error.code === 11000) {
            return res
                .status(400)
                .json({ message: "Un utilisateur avec cet email existe déjà" });
        }
        res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
    }
});
// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email et mot de passe sont requis" });
        }
        // Trouver l'utilisateur
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ message: "Email ou mot de passe incorrect" });
        }
        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ message: "Email ou mot de passe incorrect" });
        }
        // Mettre à jour lastLogin
        user.lastLogin = new Date();
        await user.save();
        // Générer le token JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" });
        res.json({
            message: "Connexion réussie",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                profileCompleted: user.profileCompleted,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Erreur serveur lors de la connexion" });
    }
});
exports.default = router;
