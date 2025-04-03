const express = require("express");
const Manga = require("../models/Manga");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Upload Route
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = `/uploads/${req.file.filename}`; // Local path
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get all manga
router.get("/", async (req, res) => {
  try {
    const manga = await Manga.find();
    res.json(manga);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single manga by ID
router.get("/:id", async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);
    if (!manga) return res.status(404).json({ message: "Manga not found" });
    res.json(manga);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
