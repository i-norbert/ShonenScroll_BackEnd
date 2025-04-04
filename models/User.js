
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const Comment = require("./Comment");


const User = sequelize.define("User", {
  userid: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
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
}, {
  hooks: {
    // Hash the password before saving or updating the user
    beforeSave: async (user) => {
      if (user.password) {
        // Only hash the password if it has been changed (e.g., during registration or password update)
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  },
});

// Instance method to compare passwords during login
User.prototype.isPasswordValid = async function(password) {
  return await bcrypt.compare(password, this.password);
};
User.hasMany(Comment);
Comment.belongsTo(User);
module.exports = User;
