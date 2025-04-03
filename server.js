const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const sequelize = require("./config/database");
const Manga = require("./models/Manga");
const Chapter = require("./models/Chapter");
const Page = require("./models/Page");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// Sync the database (creates tables)
sequelize.sync({ force: true }).then(() => {
  console.log("Database synced!");
});

// Multer setup for local image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Create Manga
app.post("/manga", async (req, res) => {
  const { title, author } = req.body;
  try {
    const manga = await Manga.create({ title, author });
    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Cover Image
app.post("/manga/:id/upload-cover", upload.single("coverImage"), async (req, res) => {
  try {
    const manga = await Manga.findByPk(req.params.id);
    if (!manga) return res.status(404).json({ error: "Manga not found" });

    manga.coverImage = `/uploads/${req.file.filename}`;
    await manga.save();

    res.json({ coverImage: manga.coverImage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Manga
app.get("/manga", async (req, res) => {
  const mangaList = await Manga.findAll({ include: Chapter });
  res.json(mangaList);
});

// Add Chapter
app.post("/manga/:mangaId/chapter", async (req, res) => {
  const { chapterNumber, title } = req.body;
  try {
    const manga = await Manga.findByPk(req.params.mangaId);
    if (!manga) return res.status(404).json({ error: "Manga not found" });

    const chapter = await Chapter.create({ chapterNumber, title, MangaId: manga.id });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Page
app.post("/chapter/:chapterId/page", upload.single("pageImage"), async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.chapterId);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    const page = await Page.create({
      pageNumber: req.body.pageNumber,
      imageUrl: `/uploads/${req.file.filename}`,
      ChapterId: chapter.id,
    });

    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Chapters & Pages
app.get("/manga/:id", async (req, res) => {
  const manga = await Manga.findByPk(req.params.id, { include: { model: Chapter, include: Page } });
  if (!manga) return res.status(404).json({ error: "Manga not found" });

  res.json(manga);
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
