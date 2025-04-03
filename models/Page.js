const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Chapter = require("./Chapter");

const Page = sequelize.define("Page", {
  pageNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING, // Store local file path
  },
});

Chapter.hasMany(Page, { onDelete: "CASCADE" });
Page.belongsTo(Chapter);

module.exports = Page;