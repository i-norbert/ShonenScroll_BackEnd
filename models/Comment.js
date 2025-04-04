const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Chapter = require("./Chapter");

// Define the Comment model
const Comment = sequelize.define("Comment", {
    // The content of the comment
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    // Optional: a username or userId field if not using a full User model
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
});

// One Chapter has many Comments
Chapter.hasMany(Comment, {
    onDelete: "CASCADE", // Delete comments if the chapter is deleted
});
Comment.belongsTo(Chapter);

// Export the model
module.exports = Comment;
