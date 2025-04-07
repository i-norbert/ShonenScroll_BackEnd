const express = require("express");
const router = express.Router();
const Manga = require("../models/Manga");
const Chapter = require("../models/Chapter");
const Page = require("../models/Page");
const User = require("../models/User");
const Comment = require("../models/Comment");
const CommentLike = require("../models/CommentLike");
const multer = require("multer");
const cors = require("cors");
const { Op } = require("sequelize");
router.use(express.json());
router.use("/uploads", express.static("uploads"));
router.use(cors());

const viewTimestamps = {};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.get("/search", async (req, res) => {
  const { title = "", author = "", sort = "titleAsc", page = 1 } = req.query;

  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  try {
    const whereClause = {
      [Op.and]: [
        title ? { title: { [Op.like]: `%${title}%` } } : {},
        author ? { author: { [Op.like]: `%${author}%` } } : {},
      ],
    };

    const orderClause = (() => {
      switch (sort) {
        case "titleAsc": return [["title", "ASC"]];
        case "titleDesc": return [["title", "DESC"]];
        case "newest": return [["createdAt", "DESC"]];
        case "oldest": return [["createdAt", "ASC"]];
        default: return [["title", "ASC"]];
      }
    })();

    const { count, rows } = await Manga.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: pageSize,
      offset,
    });

    res.json({
      results: rows,
      totalPages: Math.ceil(count / pageSize),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


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

// Upload Cover
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

// Get Manga by ID with Chapters, Pages, Comments + Likes
router.get("/:id", async (req, res) => {
  try {
    const manga = await Manga.findByPk(req.params.id, {
      include: {
        model: Chapter,
        include: [
          { model: Page },
          {
            model: Comment,
            include: [
              {
                model: User,
                attributes: ["userid", "username", "profilePicture"],
              },
              {
                model: User,
                as: "Users",
                through: { attributes: [] },
                attributes: ["userid", "username"],
              },
            ],
          },
        ],
      },
    });
    if (!manga) return res.status(404).json({ error: "Manga not found" });
    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Post Comment
router.post("/chapter/:chapterId/comment", async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.chapterId);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    const comment = await Comment.create({
      ChapterId: chapter.id,
      UserUserid: req.body.cuserId,
      content: req.body.content,
      likes: 0,
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [User],
    });

    res.status(201).json(fullComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a comment
router.post("/comment/:commentId/like", async (req, res) => {
  console.log("Liking comment", req.params.commentId, "by user", req.body.userId);
  try {
    const existing = await CommentLike.findOne({
      where: { CommentId: req.params.commentId, UserId: req.body.userId },
    });
    if (existing) return res.status(400).json({ error: "You already liked this comment." });


    await CommentLike.create({
      UserId: req.body.userId,
      CommentId: req.params.commentId*1,

    });
    console.log(typeof (req.params.commentId), typeof (req.body.userId) )
    const comment = await Comment.findByPk(req.params.commentId);
    comment.likes += 1;
    await comment.save();

    res.json({ success: true, likes: comment.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unlike a comment
router.delete("/comment/:commentId/unlike", async (req, res) => {
  const { userId } = req.body;
  try {
    const like = await CommentLike.findOne({
      where: { CommentId: req.params.commentId, UserId: userId },
    });
    if (!like) return res.status(404).json({ error: "Like not found." });

    await like.destroy();

    const comment = await Comment.findByPk(req.params.commentId);
    comment.likes -= 1;
    await comment.save();

    res.json({ success: true, likes: comment.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Increment Manga Views
router.post('/:id/view', async (req, res) => {
  const { id } = req.params;
  const userId = req.body.userId || null; // optional from frontend
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const key = `${userId || ip}-${id}`;
  const now = Date.now();

  if (viewTimestamps[key] && now - viewTimestamps[key] < 30 * 1000) {
    return res.status(200).json({ message: 'View recently counted' });
  }

  viewTimestamps[key] = now;

  try {
    const manga = await Manga.findByPk(id);
    if (!manga) return res.status(404).json({ message: 'Manga not found' });

    manga.views += 1;
    await manga.save();

    res.json({ views: manga.views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating views' });
  }
});

module.exports = router;
