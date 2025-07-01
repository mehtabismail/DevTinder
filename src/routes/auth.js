const app = require("express");
const router = app.Router();
const bcrypt = require("bcrypt");
const User = require("../model/User");

// Login Api
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid credentials");
    }
    const passwordHash = await user.validatePassword(password);
    if (!passwordHash) {
      throw new Error("Invalid credentials");
    }

    var token = await user.getJWT();
    if (!token) {
      throw new Error("Error generating token");
    }
    res.cookie("token", token);
    res.status(200).json({
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error Login user",
      error: error.message,
    });
  }
});

// SignUp Api
router.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      first_name,
      last_name,
      email,
      password: passwordHash,
    });
    await user.save();
    res.status(200).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error creating user",
      error: error.message,
    });
  }
});

// Logout Api
router.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error in Logging Out",
      error: error.message,
    });
  }
});

module.exports = router;
