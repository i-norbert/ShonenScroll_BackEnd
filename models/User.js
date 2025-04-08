const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");
const Friendship = require("./Friendship")

const User = sequelize.define("User", {
  userid: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.changed("password")) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.isPasswordValid = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.belongsToMany(User, {
  through: Friendship,
  as: "Friends",
  foreignKey: "userId",
  otherKey: "friendId",
});

module.exports = User;
