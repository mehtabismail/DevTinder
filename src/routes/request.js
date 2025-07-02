const app = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../model/ConnectionRequest");
const User = require("../model/User");
const router = app.Router();
//  Connection Request Routes
router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const fromUserId = req.user._id;
    const allowedStatuses = ["interested", "ignored"];

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status provided");
    }

    const existingConnectionRequest = await ConnectionRequestModel.findOne({
      $or: [
        {
          fromUserId,
          toUserId,
        },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      ],
    });

    if (existingConnectionRequest) {
      return res.status(400).json({
        message: "Connection request already exists",
      });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({
        message: "invalid toUserId",
      });
    }
    // return console.log(toUser);
    const connectionRequest = new ConnectionRequestModel({
      fromUserId,
      toUserId,
      status,
    });
    const data = await connectionRequest.save();

    res.status(200).json({
      message:
        status == "interested"
          ? `${req.user.first_name} is interested in ${toUser.first_name} ${toUser.last_name}`
          : `${req.user.first_name} ignored ${toUser.first_name} ${toUser.last_name}`,
      data,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error sending request",
      error: error.message,
    });
  }
});

//  Reviewing Connection Request Routes
router.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const loggedInUser = req.user;

      const rawStatus = req.params.status;
      const status = rawStatus.trim().toLowerCase();

      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status provided",
        });
      }

      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({
          message: "Connection request not found or already reviewed",
        });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.status(200).json({
        message: `Connection request ${status} successfully`,
        data,
      });
    } catch (error) {
      console.error("Review error:", error); // helpful debug
      res.status(400).json({
        message: "Error in reviewing request",
        error: error.message,
      });
    }
  }
);

module.exports = router;
