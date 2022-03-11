const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userIds: { type: [String], required: true },
    productId: { type: String, required: true },
    messages: {
      type: [
        {
          text: { type: String, required: true },
          createdAt: { type: String, required: true },
          status: { type: String, required: true },
          authorId: { type: String, required: true },
        },
      ],
    },
    changedDate: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
