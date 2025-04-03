const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Manga = require("./Manga");

const Chapter = sequelize.define("Chapter", {
  chapterNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
  },
});

Manga.hasMany(Chapter, { onDelete: "CASCADE" });
Chapter.belongsTo(Manga);

module.exports = Chapter;