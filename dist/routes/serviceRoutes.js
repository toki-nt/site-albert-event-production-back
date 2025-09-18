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
const Service_1 = __importDefault(require("../models/Service"));
const router = express.Router();
// Get all active services
router.get("/", async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isActive: true };
        if (category &&
            ["rencontre", "artistique", "accompagnement"].includes(category)) {
            filter.category = category;
        }
        const services = await Service_1.default.find(filter).sort({ createdAt: -1 });
        res.json({
            message: "Services retrieved successfully",
            services,
            count: services.length,
        });
    }
    catch (error) {
        console.error("Get services error:", error);
        res.status(500).json({ message: "Server error retrieving services" });
    }
});
// Get service by ID
router.get("/:id", async (req, res) => {
    try {
        const service = await Service_1.default.findOne({
            _id: req.params.id,
            isActive: true,
        });
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.json({
            message: "Service retrieved successfully",
            service,
        });
    }
    catch (error) {
        console.error("Get service error:", error);
        res.status(500).json({ message: "Server error retrieving service" });
    }
});
exports.default = router;
