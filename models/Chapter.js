
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Manga = require("./Manga");

// Define the Chapter model
const Chapter = sequelize.define("Chapter", {
  // Number of the chapter (e.g., 1, 2, 3)
  chapterNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // Title of the chapter
  title: {
    type: DataTypes.STRING,
  },
});

// One Manga has many Chapters
Manga.hasMany(Chapter, { onDelete: "CASCADE" });
Chapter.belongsTo(Manga);

// Export the model
module.exports = Chapter;
