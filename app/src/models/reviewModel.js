const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "you must add a review"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      required: [true, "review must belong to product"],
      ref: "Product",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "review must belong to user"],
      ref: "User",
    },
    rating: {
      type: Number,
      min: [1, "Rating must me above 1.0"],
      max: [5, "Rating must me below 5.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
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
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // console.log(stats);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  //console.log(this.rev);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.rev) await this.rev.constructor.calcAverageRating(this.rev.product);
});

const review = mongoose.model("Review", reviewSchema);

module.exports = review;
