const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Favorite = sequelize.define("Favorite", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mangaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Favorite;