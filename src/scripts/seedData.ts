import * as mongoose from "mongoose";
import * as dotenv from "dotenv";
import Service from "../models/Service";
import User from "../models/User";

dotenv.config();

const seedServices = async () => {
  const services = [
    {
      title: "Accompagnement Personnalisé",
      description:
        "Service complet d'accompagnement pour rencontres internationales",
      price: 150,
      currency: "EUR",
      category: "rencontre",
      duration: "3 mois",
      features: [
        "Traduction et interprétation",
        "Conseils culturels",
        "Support administratif",
        "Mise en relation vérifiée",
      ],
      isActive: true,
    },
    {
      title: "Production Musicale",
      description: "Production professionnelle de musique en studio",
      price: 300,
      currency: "EUR",
      category: "artistique",
      duration: "Par projet",
      features: [
        "Enregistrement studio",
        "Mixage et mastering",
        "Arrangement musical",
        "Session avec musiciens",
      ],
      isActive: true,
    },
    {
      title: "Support Administratif",
      description: "Aide pour les démarches administratives",
      price: 75,
      currency: "EUR",
      category: "accompagnement",
      duration: "À la demande",
      features: [
        "Aide aux visas",
        "Traduction de documents",
        "Accompagnement physique",
        "Conseils juridiques",
      ],
      isActive: true,
    },
  ];

  await Service.deleteMany({});
  await Service.insertMany(services);
  console.log("✅ Services seeded successfully");
};

const seedAdminUser = async () => {
  const adminExists = await User.findOne({ email: "admin@aeproduction.com" });

  if (!adminExists) {
    const adminUser = new User({
      firstName: "Admin",
      lastName: "AE Production",
      email: "admin@aeproduction.com",
      password: "admin123",
      userType: "malagasy",
      profileCompleted: true,
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully");
  }
};

const seedData = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/ae-production";
    await mongoose.connect(MONGODB_URI);

    console.log("🌱 Seeding data...");

    await seedServices();
    await seedAdminUser();

    console.log("✅ All data seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedData();
