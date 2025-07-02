const app = require("express");
const router = app.Router();
const User = require("../model/User");
const { validateUpdateUserData } = require("../utils/validations");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../model/ConnectionRequest");

const SAFE_USER_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "photoUrl",
  "about",
  "skills",
  "location",
  "gender",
];

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

//  Get all received requests
router.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", SAFE_USER_FIELDS);

    if (connectionRequests) {
      res.status(200).json({
        message: "All connection requests found successfully",
        connectionRequests,
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

//  Get all connections
router.get("/user/accepted/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", SAFE_USER_FIELDS)
      .populate("toUserId", SAFE_USER_FIELDS);

    const data = connectionRequests.map((request) => {
      if (request.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return request.toUserId;
      } else {
        return request.fromUserId;
      }
    });

    if (connectionRequests) {
      res.status(200).json({
        message: "All connections found successfully",
        data,
      });
    } else {
      res.status(200).json({
        message: "No connections found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error finding connections",
      error: error.message,
    });
  }
});

//  Feed Api
router.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    let limit = parseInt(req.query.limit) || 10; // Default to 10
    limit = limit > 100 ? 100 : limit; // Limit to a maximum of 100 users per request
    const skip = (page - 1) * limit; // Calculate the number of users to skip

    const hideUsers = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUserIds = new Set();

    hideUsers.forEach((request) => {
      hideUserIds.add(request.fromUserId.toString());
      hideUserIds.add(request.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserIds) } }, // Exclude users in hideUserIds
        { _id: { $ne: loggedInUser._id } }, // Exclude logged-in user
      ],
    })
      .select(SAFE_USER_FIELDS)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Users found successfully",
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error finding user",
      error: error.message,
    });
  }
});

module.exports = router;
