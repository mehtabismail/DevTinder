const express = require("express");
const connectDB = require("./config/database");
const app = express();
const port = 3000;
const jwt_secret = "your_jwt_secret"; // Replace with your actual secret key
const User = require("./model/User");
const { validateUpdateUserData } = require("./utils/validations");
const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

// Login Api
app.post("/login", async (req, res) => {
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
app.post("/signup", async (req, res) => {
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

//  Get Profile by email
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      message: "User found successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error finding user",
      error: error.message,
    });
  }
});

//  Get User by email
app.get("/user", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email });
    if (!!user) {
      res.status(200).json({
        message: "User found successfully",
        user,
      });
    } else {
      res.status(200).json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error finding user",
      error: error.message,
    });
  }
});

//  Get User by ID
app.get("/user/:id", async (req, res) => {
  const id = req.params?.id;
  try {
    const user = await User.findById(id);
    if (!!user) {
      res.status(200).json({
        message: "User found successfully",
        user,
      });
    } else {
      res.status(200).json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error finding user",
      error: error.message,
    });
  }
});

//  Update User by ID
app.patch("/update/:id", async (req, res) => {
  const id = req.params?.id;
  const updates = req.body;
  try {
    validateUpdateUserData(updates); // validate the updates
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      // new: true, // return the updated document
      runValidators: true, // validate based on schema
      returnDocument: "after", // return the updated document
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error updating user",
      error: error.message,
    });
  }
});

//  Delete User by ID
app.delete("/delete", async (req, res) => {
  const id = req.body.id;
  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      res.status(200).json({
        message: "User deleted successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
});

//  Feed Api
app.get("/feed", async (req, res) => {
  try {
    const user = await User.find({});
    if (!!user) {
      res.status(200).json({
        message: "User found successfully",
        user,
      });
    } else {
      res.status(200).json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error finding user",
      error: error.message,
    });
  }
});

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
