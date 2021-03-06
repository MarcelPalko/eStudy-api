const mongoose = require("mongoose");
const productModel = require("../models/Product");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    class: { type: String },
    favouriteProducts: { type: [productModel.schema], required: false },
    notifications: {
      type: [
        {
          text: { type: String },
          type: { type: String },
          createdAt: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
