const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Friendship = sequelize.define("Friendship", {
  status: {
    type: DataTypes.ENUM("pending", "accepted"),
    defaultValue: "pending",
  },
});

module.exports = Friendship;