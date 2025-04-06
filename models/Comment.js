const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Chapter = require("./Chapter");
const User = require("./User");

const Comment = sequelize.define("Comment", {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
});

Chapter.hasMany(Comment, { onDelete: "CASCADE" });
Comment.belongsTo(Chapter);

User.hasMany(Comment);
Comment.belongsTo(User);

module.exports = Comment;
