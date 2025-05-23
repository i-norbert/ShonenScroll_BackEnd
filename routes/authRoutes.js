require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const verifyToken = require("../middlewares/jwtverify")
const router = express.Router();
router.use(express.json());
router.use(cors());



// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { userid, username, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ userid, username, email, password });

    res.status(201).json({
      message: "User created",
      user: {
        userid: user.userid,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "No user is registered with this email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password." });
    }

    console.log("JWT_SECRET:"+process.env.JWT_SECRET);

    const jwtoken = jwt.sign({ id: user.userid }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      user: {
        userid: user.userid,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token: jwtoken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
      const user = await User.findByPk(req.userId);

      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ user });
  } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Server error" });
  }
});
// GET /users/default-avatars
router.get("/default-avatars", (req, res) => {
  const avatarsDir = path.join(__dirname, "../defaults");

  fs.readdir(avatarsDir, (err, files) => {
    if (err) {
      console.error("Error reading default avatars:", err);
      return res.status(500).json({ error: "Failed to load avatars" });
    }

    const avatarUrls = files.map(file => `http://localhost:5555/api/defaults/${file}`);
    res.json(avatarUrls);
  });
});

// POST /users/:id/set-avatar
router.post("/:id/set-avatar", async (req, res) => {
  const { avatarName } = req.body; // like "avatar1.png"
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const validAvatars = [
      "ichigo.jpg",
      "goku.jpg",
      "nami.jpg",
      "naruto.jpg",
      "gon.jpg",
      "2b.jpg"
      // Add all valid avatar file names here
    ];

    if (!validAvatars.includes(avatarName)) {
      return res.status(400).json({ error: "Invalid avatar selection" });
    }

    user.profilePicture = `/defaults/${avatarName}`;
    await user.save();

    res.json({ message: "Avatar updated", avatar: user.profilePicture });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE PROFILE
router.put("/users/:id", async (req, res) => {
  const { username, profilePicture } = req.body;
  try {
    const user = await User.findOne({ where: { userid: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username) user.username = username;
    if (profilePicture) user.profilePicture = profilePicture;
    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        userid: user.userid,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ✅ ADD FRIEND
router.post("/users/:id/friends", async (req, res) => {
  const { friendId } = req.body;
  try {
    const user = await User.findOne({ where: { userid: req.params.id } });
    const friend = await User.findOne({ where: { userid: friendId } });
    if (!user || !friend) return res.status(404).json({ error: "User or friend not found" });

    await user.addFriend(friend);
    res.json({ message: "Friend added" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add friend" });
  }
});

// ✅ REMOVE FRIEND
router.delete("/users/:id/friends/:friendId", async (req, res) => {
  try {
    const user = await User.findOne({ where: { userid: req.params.id } });
    const friend = await User.findOne({ where: { userid: req.params.friendId } });
    if (!user || !friend) return res.status(404).json({ error: "User or friend not found" });

    await user.removeFriend(friend);
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

// ✅ DELETE USER
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findOne({ where: { userid: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ✅ GET SINGLE USER BY ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findOne({ where: { userid: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      userid: user.userid,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


module.exports = router;
