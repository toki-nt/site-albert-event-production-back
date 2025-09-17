import * as express from "express";
import GalleryItem from "../models/GalleryItem";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Get all gallery items with optional filtering
router.get("/", async (req, res) => {
  try {
    const { category, featured, limit = 12, page = 1 } = req.query;

    const filter: any = {};

    if (
      category &&
      ["musique", "video", "evenement", "rencontre"].includes(
        category as string
      )
    ) {
      filter.category = category;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    const items = await GalleryItem.find(filter)
      .populate("createdBy", "firstName lastName userType")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await GalleryItem.countDocuments(filter);

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
  } catch (error) {
    console.error("Get gallery items error:", error);
    res.status(500).json({ message: "Server error retrieving gallery items" });
  }
});

// Create new gallery item (authenticated)
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, description, imageUrl, category, tags } = req.body;

    if (!title || !imageUrl || !category) {
      return res
        .status(400)
        .json({ message: "Title, imageUrl and category are required" });
    }

    const galleryItem = new GalleryItem({
      title,
      description,
      imageUrl,
      category,
      tags: tags || [],
      createdBy: req.user!._id,
    });

    await galleryItem.save();
    await galleryItem.populate("createdBy", "firstName lastName userType");

    res.status(201).json({
      message: "Gallery item created successfully",
      item: galleryItem,
    });
  } catch (error: any) {
    console.error("Create gallery item error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: "Invalid data", errors });
    }

    res.status(500).json({ message: "Server error creating gallery item" });
  }
});

export default router;
