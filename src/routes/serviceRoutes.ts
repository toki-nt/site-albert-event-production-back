import * as express from "express";
import Service from "../models/Service";

const router = express.Router();

// Get all active services
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const filter: any = { isActive: true };
    if (
      category &&
      ["rencontre", "artistique", "accompagnement"].includes(category as string)
    ) {
      filter.category = category;
    }

    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.json({
      message: "Services retrieved successfully",
      services,
      count: services.length,
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ message: "Server error retrieving services" });
  }
});

// Get service by ID
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findOne({
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
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({ message: "Server error retrieving service" });
  }
});

export default router;
