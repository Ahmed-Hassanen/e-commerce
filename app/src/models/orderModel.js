const mongoose = require("mongoose");
const Product = require("./productModel");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const product = require("./productModel");

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      required: [true, "order must belong to product"],
      ref: "Product",
    },
    buyer: {
      type: mongoose.Schema.ObjectId,
      required: [true, "order must belong to buyer"],
      ref: "User",
    },
    description: {
      type: String,
    },
    done: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    quantity: {
      type: Number,
      required: [true, "order must have a quantity"],
      min: 1,
    },
    address: {
      type: String,
      required: [true, "order must have an address"],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const order = mongoose.model("Order", orderSchema);

module.exports = order;
