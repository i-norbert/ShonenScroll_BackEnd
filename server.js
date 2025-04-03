const express = require("express");
const cors = require("cors");

const sequelize = require("./config/database");
const mangaRoutes = require("./routes/mangaRoutes");

const app = express();

app.use("/manga",mangaRoutes)
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// Sync the database (creates tables)
sequelize.sync({ force: true }).then(() => {
  console.log("Database synced!");
});





// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
