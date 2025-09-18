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
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const auth_1 = require("../middleware/auth");
const router = express.Router();
// Get accompaniment services
router.get("/services", async (req, res) => {
    try {
        const services = [
            {
                id: 1,
                title: "Aide Administrative Complète",
                description: "Assistance complète pour toutes les démarches administratives",
                price: 75,
                currency: "EUR",
                duration: "À la demande",
                features: [
                    "Demandes de visa et titres de séjour",
                    "Traduction et légalisation de documents",
                    "Accompagnement aux rendez-vous administratifs",
                    "Conseils juridiques de base",
                ],
                category: "administratif",
            },
            {
                id: 2,
                title: "Support Linguistique Personnalisé",
                description: "Cours de langue et services de traduction sur mesure",
                price: 40,
                currency: "EUR",
                duration: "Par session de 2h",
                features: [
                    "Cours de français ou malagasy",
                    "Traduction simultanée",
                    "Préparation aux entretiens",
                    "Support écrit et oral",
                ],
                category: "linguistique",
            },
            {
                id: 3,
                title: "Accueil et Intégration",
                description: "Service complet d'accueil et d'intégration à Madagascar",
                price: 120,
                currency: "EUR",
                duration: "Pack 1 semaine",
                features: [
                    "Accueil à l'aéroport",
                    "Aide à la recherche de logement",
                    "Visite d'orientation de la ville",
                    "Conseils pratiques et culturels",
                ],
                category: "integration",
            },
            {
                id: 4,
                title: "Médiation Culturelle",
                description: "Facilitation des échanges et résolution des malentendus culturels",
                price: 60,
                currency: "EUR",
                duration: "Par session",
                features: [
                    "Médiation dans les relations",
                    "Explication des codes culturels",
                    "Résolution des malentendus",
                    "Support continu",
                ],
                category: "mediation",
            },
        ];
        res.json({
            message: "Services d'accompagnement récupérés",
            services,
        });
    }
    catch (error) {
        console.error("Get accompaniment services error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
// Create accompaniment request
router.post("/request", auth_1.authenticate, async (req, res) => {
    try {
        const { serviceId, message, preferredDate } = req.body;
        if (!serviceId) {
            return res.status(400).json({ message: "Service ID requis" });
        }
        // Simuler la création d'une demande
        const request = {
            id: Math.random().toString(36).substr(2, 9),
            userId: req.user._id,
            serviceId,
            message: message || "",
            preferredDate: preferredDate || new Date(),
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        res.status(201).json({
            message: "Demande d'accompagnement créée avec succès",
            request,
        });
    }
    catch (error) {
        console.error("Create accompaniment request error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
// Get user accompaniment requests
router.get("/my-requests", auth_1.authenticate, async (req, res) => {
    try {
        // Simuler la récupération des demandes
        const requests = [
            {
                id: "req_123",
                serviceId: 1,
                serviceName: "Aide Administrative Complète",
                status: "completed",
                createdAt: new Date("2024-01-15"),
                message: "Besoin d'aide pour mon visa",
            },
            {
                id: "req_456",
                serviceId: 2,
                serviceName: "Support Linguistique Personnalisé",
                status: "pending",
                createdAt: new Date("2024-01-20"),
                message: "Cours de malagasy urgent",
            },
        ];
        res.json({
            message: "Demandes d'accompagnement récupérées",
            requests,
        });
    }
    catch (error) {
        console.error("Get user requests error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
// Get accompaniment request by ID
router.get("/request/:id", auth_1.authenticate, async (req, res) => {
    try {
        const requestId = req.params.id;
        // Simuler la récupération d'une demande spécifique
        const request = {
            id: requestId,
            userId: req.user._id,
            serviceId: 1,
            serviceName: "Aide Administrative Complète",
            status: "completed",
            message: "Besoin d'aide pour mon visa de long séjour",
            preferredDate: new Date("2024-02-01"),
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-16"),
            conversations: [
                {
                    id: 1,
                    type: "user",
                    message: "Bonjour, j'ai besoin d'aide pour mon visa.",
                    timestamp: new Date("2024-01-15T10:00:00"),
                },
                {
                    id: 2,
                    type: "admin",
                    message: "Bonjour, nous pouvons vous aider. Quels documents avez-vous?",
                    timestamp: new Date("2024-01-15T10:30:00"),
                },
            ],
        };
        res.json({
            message: "Détails de la demande",
            request,
        });
    }
    catch (error) {
        console.error("Get request details error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.default = router;
