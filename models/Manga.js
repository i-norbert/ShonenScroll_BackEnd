const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Favorite = require("./Favorites");

const Manga = sequelize.define("Manga", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
  },
  coverImage: {
    type: DataTypes.STRING,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

Manga.belongsToMany(require("./User"), {
  through: "Favorite",
  foreignKey: "mangaId",
  as: "likedBy",
});

module.exports = Manga;
