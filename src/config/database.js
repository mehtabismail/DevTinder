const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(
      "mongodb+srv://admin:admin@cluster0.vdc7u8s.mongodb.net/devTinder"
    );
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
