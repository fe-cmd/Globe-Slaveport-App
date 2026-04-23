import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

import Location from "./models/Location.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ---------------- APP INIT ----------------
const app = express();
app.use(cors());
app.use(express.json());

// ---------------- FIX __dirname (ESM REQUIRED) ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- DEBUG ----------------
console.log("🔑 MONGO_URI exists:", !!process.env.MONGO_URI);

// ---------------- CLOUDINARY CONFIG ----------------
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ---------------- MULTER (CLOUDINARY STORAGE) ----------------
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "slaveport/locations",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// ---------------- 🌍 GEO FUNCTION ----------------
// ---------------- 🌍 GEO FUNCTION ----------------
const getCoordinates = async (city, country) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${city},${country}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "autoglobeweb (oluferonmijoshua@gmail.com)"
      }
    });

    const data = await res.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error("Geo error:", err);
  }

  return { lat: 0, lng: 0 };
};
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ---------------- DB CONNECTION ----------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
      family: 4,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:");
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// ---------------- API ROUTES ----------------

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "SlavePort Backend Running 🚀",
  });
});

// GET ALL LOCATIONS
app.get("/api/locations", async (req, res) => {
  const data = await Location.find();
  res.json(data);
});

// CREATE LOCATION
app.post("/api/locations", upload.single("image"), async (req, res) => {
  try {
    // ✅ CORRECT
    const coords = await getCoordinates(
      req.body.city,
      req.body.country
    );

    await sleep(1000); // ⏱️ prevent rate limit

    const newLocation = new Location({
      ...req.body,
      lat: coords.lat,
      lng: coords.lng,
      picture: req.file?.path,
    });

    await newLocation.save();
    res.json(newLocation);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE LOCATION
app.put("/api/locations/:id", upload.single("image"), async (req, res) => {
  try {
    const updatedData = { ...req.body };

    // ✅ recalc coords if city/country exists
    if (req.body.city && req.body.country) {
      const coords = await getCoordinates(
        req.body.city,
        req.body.country
      );

      await sleep(1000);

      updatedData.lat = coords.lat;
      updatedData.lng = coords.lng;
    }

    if (req.file) {
      updatedData.picture = req.file.path;
    }

    const updated = await Location.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE LOCATION
app.delete("/api/locations/:id", async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SERVE FRONTEND (PRODUCTION ONLY) ----------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend-globe/build")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../frontend-globe/build/index.html")
    );
  });
}

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});