const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");
const Comment = require("./Comment");
const bcrypt = require("bcryptjs");

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
    }
  },
});

User.prototype.isPasswordValid = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Comments
User.hasMany(Comment);
Comment.belongsTo(User);

// Friends relationship (self-referencing many-to-many)
User.belongsToMany(User, {
  as: "Friends",
  through: "UserFriends",
  foreignKey: "userId",
  otherKey: "friendId"
});

module.exports = User;
