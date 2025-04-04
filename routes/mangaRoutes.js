  const express = require("express");
const router = express.Router();
const Manga = require("../models/Manga");
const Chapter = require("../models/Chapter");
const Page = require("../models/Page");
const User = require("../models/User");
const Comment = require("../models/Comment");
const multer = require("multer");
const cors = require("cors");



router.use(express.json());
router.use("/uploads", express.static("uploads")); // Serve uploaded images
router.use(cors());



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
router.post("/", async (req, res) => {
  const { title, author } = req.body;
  try {
    const manga = await Manga.create({ title, author });
    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Cover Image
router.post("/:id/upload-cover", upload.single("coverImage"), async (req, res) => {
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
router.get("/", async (req, res) => {
  const mangaList = await Manga.findAll({ include: Chapter });
  res.json(mangaList);
});

// Add Chapter
router.post("/:mangaId/chapter", async (req, res) => {
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
router.post("/chapter/:chapterId/page", upload.single("pageImage"), async (req, res) => {
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
router.get("/:id", async (req, res) => {
  const manga = await Manga.findByPk(req.params.id, { include: { model: Chapter, include: [
        {
          model: Page, // Include Page for each Chapter
        },
        {
          model: Comment, // Include Comment for each Chapter
          include: { model: User }, // Optionally, you can include the User who made the comment
        },
      ]}
  });
  if (!manga) return res.status(404).json({ error: "Manga not found" });

  res.json(manga);
});


router.post("/chapter/:chapterId/comment", async (req, res) => {

  try {
    const chapter = await Chapter.findByPk(req.params.chapterId);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    const comment = await Comment.create({
      ChapterId : req.params.chapterId,
      UserId: req.body.cuserId,
      content: req.body.content,
      likes: 0,
    });

    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

})

module.exports = router;
