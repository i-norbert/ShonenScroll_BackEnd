require("dotenv").config();
const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const Friendship = require("./models/Friendship");
const sequelize = require("./config/database");
const mangaRoutes = require("./routes/mangaRoutes");
const authRoutes = require("./routes/authRoutes");
const CommentLike = require("./models/CommentLike"); 
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Manga = require("./models/Manga");

const app = express();

app.use("/api/manga",mangaRoutes)
app.use("/api/auth",authRoutes)
app.use(express.json());
app.use(cors());
app.use("/api/uploads", express.static("uploads")); 
app.use("/api/defaults", express.static("defaults"));
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes)


User.belongsToMany(User, {
  through: Friendship,
  as: "Friends",
  foreignKey: "userId",
  otherKey: "friendId",
});


Manga.belongsToMany(User, {
  through: "Favorite",
  foreignKey: "mangaId",
  as: "likedBy",
});

User.belongsToMany(Manga, {
  through: "Favorite",
  foreignKey: "userId",
  as: "favorites",
});


sequelize.sync().then(() => {
  console.log("Database synced!");

  app.listen(5555, () => {
    console.log("Server running on port 5555");
  });
});
