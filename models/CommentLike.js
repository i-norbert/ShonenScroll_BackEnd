const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Comment = require("./Comment");
const User = require("./User");

const CommentLike = sequelize.define("CommentLike", {
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    CommentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

User.belongsToMany(Comment, {
    through: CommentLike,
    foreignKey: "UserId",
    otherKey: "CommentId",
});

Comment.belongsToMany(User, {
    through: CommentLike,
    foreignKey: "CommentId",
    otherKey: "UserId",
});

module.exports = CommentLike;
