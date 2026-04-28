const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    joinRequests: [
      {
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        source: {
          type: String,
          enum: ["self", "invite"],
          default: "self",
        },
        approvals: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        status: {
          type: String,
          enum: ["pending", "approved"],
          default: "pending",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expenseRetentionDays: {
      type: Number,
      default: 3650,
      min: 30,
      max: 36500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
