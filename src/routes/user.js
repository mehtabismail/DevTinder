const app = require("express");
const router = app.Router();
const User = require("../model/User");
const { validateUpdateUserData } = require("../utils/validations");

//  Get User by email
router.get("/user", async (req, res) => {
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
router.get("/user/:id", async (req, res) => {
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
router.patch("/update/:id", async (req, res) => {
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
router.delete("/delete", async (req, res) => {
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
router.get("/feed", async (req, res) => {
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

module.exports = router;
