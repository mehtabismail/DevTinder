const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cors = require("cors");
const port = 3000;
const { default: mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: "http://localhost:5173", // Adjust this to your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json());
app.use(cookieParser());

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const requestRoutes = require("./routes/request");

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", profileRoutes);
app.use("/", requestRoutes);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("Database connection failed:", error.message);
  });
