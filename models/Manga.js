const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Manga = sequelize.define("Manga", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
  },
  coverImage: {
    type: DataTypes.STRING, // Store local file path
  },
});

module.exports = Manga;