const mongoose = require("mongoose");
const vaidator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwt_secret = "your_jwt_secret";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!vaidator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!vaidator.isStrongPassword(value)) {
          throw new Error(
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, #, $, %, !)."
          );
        }
      },
    },
    gender: {
      type: String,
      lowercase: true,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is invalid");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    photoUrl: {
      type: String,
      default:
        "https://med.gov.bz/wp-content/uploads/2020/08/dummy-profile-pic.jpg",
      validate(value) {
        if (!vaidator.isURL(value)) {
          throw new Error("Photo URL is invalid");
        }
      },
    },
    about: {
      type: String,
      default: "This is a default about of user",
      validate: {
        validator: function (value) {
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount <= 100;
        },
        message: "Description must not exceed 50 words",
      },
    },
    skills: {
      type: [String],
    },
    location: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user?._id }, jwt_secret, {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const passwordHash = await bcrypt.compare(password, user?.password);
  return passwordHash;
};

module.exports = mongoose.model("User", userSchema);
