import * as express from "express";
import * as mongoose from "mongoose";
import { authenticate, AuthRequest } from "../middleware/auth";
import User from "../models/User";

const router = express.Router();

// Get user profile
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      message: "Profil utilisateur récupéré avec succès",
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Update user profile (authenticated)
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;

    // Vérifier que l'utilisateur modifie son propre profil
    if (userId !== req.user!._id.toString()) {
      return res
        .status(403)
        .json({ message: "Non autorisé à modifier ce profil" });
    }

    const { firstName, lastName, dateOfBirth, phone, address, bio } = req.body;
    const updates: any = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (bio) updates.bio = bio;

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, profileCompleted: true },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profil mis à jour avec succès",
      user,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: "Données invalides", errors });
    }

    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour du profil" });
  }
});

// Upload profile picture (simplifié)
router.post("/:id/picture", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;

    if (userId !== req.user!._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "URL de l'image requise" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    ).select("-password");

    res.json({
      message: "Photo de profil mise à jour avec succès",
      user,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
