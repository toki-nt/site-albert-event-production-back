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
const mongoose = __importStar(require("mongoose"));
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const router = express.Router();
// Get user profile
router.get("/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }
        const user = await User_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json({
            message: "Profil utilisateur récupéré avec succès",
            user,
        });
    }
    catch (error) {
        console.error("Get user profile error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
// Update user profile (authenticated)
router.put("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        // Vérifier que l'utilisateur modifie son propre profil
        if (userId !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Non autorisé à modifier ce profil" });
        }
        const { firstName, lastName, dateOfBirth, phone, address, bio } = req.body;
        const updates = {};
        if (firstName)
            updates.firstName = firstName;
        if (lastName)
            updates.lastName = lastName;
        if (dateOfBirth)
            updates.dateOfBirth = dateOfBirth;
        if (phone)
            updates.phone = phone;
        if (address)
            updates.address = address;
        if (bio)
            updates.bio = bio;
        const user = await User_1.default.findByIdAndUpdate(userId, { ...updates, profileCompleted: true }, { new: true, runValidators: true }).select("-password");
        res.json({
            message: "Profil mis à jour avec succès",
            user,
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: "Données invalides", errors });
        }
        res
            .status(500)
            .json({ message: "Erreur serveur lors de la mise à jour du profil" });
    }
});
// Upload profile picture (simplifié)
router.post("/:id/picture", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        if (userId !== req.user._id.toString()) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ message: "URL de l'image requise" });
        }
        const user = await User_1.default.findByIdAndUpdate(userId, { profilePicture: imageUrl }, { new: true }).select("-password");
        res.json({
            message: "Photo de profil mise à jour avec succès",
            user,
        });
    }
    catch (error) {
        console.error("Upload profile picture error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.default = router;
