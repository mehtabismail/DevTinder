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

module.exports = { validateUpdateUserData };
