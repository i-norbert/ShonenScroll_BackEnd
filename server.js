const express = require("express");
const cors = require("cors");

const sequelize = require("./config/database");
const mangaRoutes = require("./routes/mangaRoutes");
const authRoutes = require("./routes/authRoutes");
const CommentLike = require("./models/CommentLike"); // import it so it registers


const app = express();

app.use("/manga",mangaRoutes)
app.use("/auth",authRoutes)
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded images
app.use("/defaults", express.static("defaults"));

sequelize.sync().then(() => {
  console.log("Database synced!");

  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
});
