const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product must has a name"],
    },
    description: {
      type: String,
      required: [true, "product must has a description"],
    },
    photo: {
      type: String,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      required: [true, "product must has a category"],
      ref: "Category",
    },
    price: {
      type: Number,
      required: [true, "product must has a price"],
      min: 1,
    },
    quantity: {
      type: Number,
      required: [true, "product must has a quantity"],
      min: 0,
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      required: [true, "product must has a seller"],
      ref: "User",
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating must me above 0.0"],
      max: [5, "Rating must me below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    imageCover: String,
    images: [String],
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
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

productSchema.pre(/^findOne/, function (next) {
  this.populate({ path: "category" });

  next();
});

const product = mongoose.model("Product", productSchema);

module.exports = product;
