const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cors = require("cors");

const router = express.Router();

router.use(express.json());
router.use(cors());

// Register
router.post("/register", async (req, res) => {
  try {
    const { userid,username, email, password } = req.body;
    
    // Create a new user instance and save it
    const user = await User.create({ userid,username, email, password });
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "No user is registered with this email." });

    // Compare the entered password with the hashed password
    const isMatch = await user.isPasswordValid(password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password." });

    const JWT_SECRET = 'your_very_secret_key_here';

    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, userId: user.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll(); // Adjust according to your ORM
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
