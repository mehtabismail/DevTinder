const validator = require("validator");

const validateUpdateUserData = (updates) => {
  const allowedUpdates = [
    "gender",
    "age",
    "photoUrl",
    "about",
    "skills",
    "location",
  ];

  const isUpdateAllowed = Object.keys(updates).every((value) =>
    allowedUpdates.includes(value)
  );

  if (!isUpdateAllowed) {
    throw new Error("Invalid update fields");
  }

  if (updates.skills.length > 10) {
    throw new Error("Skills length should be less than 10");
  }
};

const passwordValidate = (value) => {
  if (!validator.isStrongPassword(value)) {
    throw new Error(
      "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, #, $, %, !)."
    );
  }
};

module.exports = { validateUpdateUserData, passwordValidate };
