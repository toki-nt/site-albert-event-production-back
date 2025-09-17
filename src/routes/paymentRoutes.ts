import * as express from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import Payment from "../models/Payment";
import Service from "../models/Service";
import User from "../models/User";

const router = express.Router();

// Create payment intent
router.post("/create-intent", authenticate, async (req: AuthRequest, res) => {
  try {
    const { serviceId, paymentMethod } = req.body;

    if (!serviceId || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "Service ID et méthode de paiement requis" });
    }

    // Vérifier le service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }

    // Créer un paiement
    const payment = new Payment({
      userId: req.user!._id,
      serviceId,
      amount: service.price,
      currency: service.currency,
      paymentMethod,
      status: "pending",
    });

    await payment.save();

    // Simuler un intent de paiement (à remplacer par Stripe en production)
    const mockPaymentIntent = {
      id: `pi_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `set_${Math.random().toString(36).substr(2, 24)}`,
      amount: service.price * 100, // en cents
      currency: service.currency.toLowerCase(),
    };

    payment.paymentIntentId = mockPaymentIntent.id;
    payment.clientSecret = mockPaymentIntent.client_secret;
    await payment.save();

    res.json({
      message: "Intent de paiement créé",
      paymentIntent: mockPaymentIntent,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Confirm payment
router.post("/confirm", authenticate, async (req: AuthRequest, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user!._id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    // Simuler la confirmation de paiement
    payment.status = "completed";
    await payment.save();

    res.json({
      message: "Paiement confirmé avec succès",
      payment,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Get user payments
router.get("/history", authenticate, async (req: AuthRequest, res) => {
  try {
    const payments = await Payment.find({ userId: req.user!._id })
      .populate("serviceId", "title price currency")
      .sort({ createdAt: -1 });

    res.json({
      message: "Historique des paiements",
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
