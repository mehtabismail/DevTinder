const app = require("express");
const bcrypt = require("bcrypt");
const router = app.Router();
const { userAuth } = require("../middlewares/auth");
const {
  validateUpdateUserData,
  passwordValidate,
} = require("../utils/validations");
const User = require("../model/User");

//  Get Profile by email
router.get("/profile/view", userAuth, async (req, res) => {
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

//  Profile Edit Api
router.patch("/profile/edit", userAuth, async (req, res) => {
  const updates = req.body;
  const loggedInUser = req.user;

  try {
    validateUpdateUserData(updates); // validate the updates
    Object.keys(updates).forEach((key) => {
      loggedInUser[key] = updates[key];
    });

    await loggedInUser.save();

    res.status(200).json({
      message: "Profile edited successfully!!",
      user: loggedInUser,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error editing user",
      error: error.message,
    });
  }
});

//  Update Password Api
router.post("/profile/update-password", userAuth, async (req, res) => {
  try {
    const { email } = req.user;
    const { current_password, new_password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found!!");
    }
    if (!current_password || !new_password) {
      throw new Error("Current password and new password are required");
    }

    const passwordHash = await user.validatePassword(current_password);
    if (!passwordHash) {
      throw new Error("Current password is incorrect");
    }
    if (current_password === new_password) {
      throw new Error(
        "New password cannot be the same as the current password"
      );
    }

    passwordValidate(new_password); // validate the new password

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    user.password = newPasswordHash;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error updating password",
      error: error.message,
    });
  }
});

module.exports = router;
