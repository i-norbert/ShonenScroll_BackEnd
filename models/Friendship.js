const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Friendship = sequelize.define("Friendship", {
  status: {
    type: DataTypes.ENUM("pending", "accepted"),
    defaultValue: "pending",
  },
});

// These associations must come after both models are defined
Friendship.belongsTo(User, { foreignKey: "userId", as: "Requester" });
Friendship.belongsTo(User, { foreignKey: "friendId", as: "Addressee" });

module.exports = Friendship;
