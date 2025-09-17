import * as express from "express";
import * as jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Un utilisateur avec cet email existe déjà" });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      userType,
    });

    await user.save();

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

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
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
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
    const user = await User.findOne({ email });
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
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

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
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
});

export default router;
