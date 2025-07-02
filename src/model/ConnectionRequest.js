const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "rejected", "accepted"],
        message: `{VALUE} is not a valid status`,
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", async function (next) {
  const connectionRequest = this;

  if (!connectionRequest.fromUserId || !connectionRequest.toUserId) {
    throw new Error("fromUserId and toUserId are required");
  }

  if (
    connectionRequest.fromUserId.toString() ===
    connectionRequest.toUserId.toString()
  ) {
    throw new Error("You cannot send a connection request to yourself");
  }

  next();
});
module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
