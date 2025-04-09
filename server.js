const express = require("express");
const cors = require("cors");

const sequelize = require("./config/database");
const mangaRoutes = require("./routes/mangaRoutes");
const authRoutes = require("./routes/authRoutes");
const CommentLike = require("./models/CommentLike"); // import it so it registers
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use("/api/manga",mangaRoutes)
app.use("/api/auth",authRoutes)
app.use(express.json());
app.use(cors());
app.use("/api/uploads", express.static("uploads")); // Serve uploaded images
app.use("/api/defaults", express.static("defaults"));
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes)

const User = require("./models/User");
const Friendship = require("./models/Friendship");

User.belongsToMany(User, {
  through: Friendship,
  as: "Friends",
  foreignKey: "userId",
  otherKey: "friendId",
});


sequelize.sync().then(() => {
  console.log("Database synced!");

  app.listen(5555, () => {
    console.log("Server running on port 5555");
  });
});
