import * as express from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import User from "../models/User";

const router = express.Router();

// Get current user profile
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    res.json({
      message: "Profil utilisateur récupéré avec succès",
      user: req.user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Update user profile
router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, userType } = req.body;
    const updates: any = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (userType) updates.userType = userType;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { ...updates, profileCompleted: true },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

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

// Get all users (for admin purposes)
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      message: "Utilisateurs récupérés avec succès",
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
