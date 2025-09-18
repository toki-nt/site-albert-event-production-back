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
const GalleryItem_1 = __importDefault(require("../models/GalleryItem"));
const auth_1 = require("../middleware/auth");
const router = express.Router();
// Get all gallery items with optional filtering
router.get("/", async (req, res) => {
    try {
        const { category, featured, limit = 12, page = 1 } = req.query;
        const filter = {};
        if (category &&
            ["musique", "video", "evenement", "rencontre"].includes(category)) {
            filter.category = category;
        }
        if (featured === "true") {
            filter.isFeatured = true;
        }
        const items = await GalleryItem_1.default.find(filter)
            .populate("createdBy", "firstName lastName userType")
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await GalleryItem_1.default.countDocuments(filter);
        res.json({
            message: "Gallery items retrieved successfully",
            items,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get gallery items error:", error);
        res.status(500).json({ message: "Server error retrieving gallery items" });
    }
});
// Create new gallery item (authenticated)
router.post("/", auth_1.authenticate, async (req, res) => {
    try {
        const { title, description, imageUrl, category, tags } = req.body;
        if (!title || !imageUrl || !category) {
            return res
                .status(400)
                .json({ message: "Title, imageUrl and category are required" });
        }
        const galleryItem = new GalleryItem_1.default({
            title,
            description,
            imageUrl,
            category,
            tags: tags || [],
            createdBy: req.user._id,
        });
        await galleryItem.save();
        await galleryItem.populate("createdBy", "firstName lastName userType");
        res.status(201).json({
            message: "Gallery item created successfully",
            item: galleryItem,
        });
    }
    catch (error) {
        console.error("Create gallery item error:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: "Invalid data", errors });
        }
        res.status(500).json({ message: "Server error creating gallery item" });
    }
});
exports.default = router;
