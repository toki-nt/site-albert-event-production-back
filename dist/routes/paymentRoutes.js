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
const auth_1 = require("../middleware/auth");
const Payment_1 = __importDefault(require("../models/Payment"));
const Service_1 = __importDefault(require("../models/Service"));
const router = express.Router();
// Create payment intent
router.post("/create-intent", auth_1.authenticate, async (req, res) => {
    try {
        const { serviceId, paymentMethod } = req.body;
        if (!serviceId || !paymentMethod) {
            return res
                .status(400)
                .json({ message: "Service ID et méthode de paiement requis" });
        }
        // Vérifier le service
        const service = await Service_1.default.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé" });
        }
        // Créer un paiement
        const payment = new Payment_1.default({
            userId: req.user._id,
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
    }
    catch (error) {
        console.error("Create payment intent error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
// Confirm payment
router.post("/confirm", auth_1.authenticate, async (req, res) => {
    try {
        const { paymentId } = req.body;
        const payment = await Payment_1.default.findOne({
            _id: paymentId,
            userId: req.user._id,
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
    }
    catch (error) {
        console.error("Confirm payment error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
// Get user payments
router.get("/history", auth_1.authenticate, async (req, res) => {
    try {
        const payments = await Payment_1.default.find({ userId: req.user._id })
            .populate("serviceId", "title price currency")
            .sort({ createdAt: -1 });
        res.json({
            message: "Historique des paiements",
            payments,
        });
    }
    catch (error) {
        console.error("Get payments error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.default = router;
