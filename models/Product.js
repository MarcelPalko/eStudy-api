const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    categories: { type: [String], required: true },
    images: { type: [String] },
    userId: { type: String, required: true },
    status: { type: String, required: true },
    chatIds: { type: [String] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
