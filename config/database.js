const { Sequelize } = require("sequelize");

// Create a new SQLite database (stored in a file)
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite", // The file where SQLite stores data
  logging: false, // Set to true to see SQL queries in the console
});

// Test the connection
sequelize
  .authenticate()
  .then(() => console.log("SQLite database connected!"))
  .catch((err) => console.error("Error connecting to SQLite:", err));

module.exports = sequelize;