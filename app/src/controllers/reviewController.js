const Review = require("../models/reviewModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

exports.setProductUserIds = (req, res, next) => {
  req.body.product = req.params.productId;
  req.body.user = req.user.id;
  next();
};

exports.createReview = handlerFactory.createOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.getReview = handlerFactory.getOne(Review);
exports.isReviewOwner = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new appError("No review found with that id", 404));
  }

  if (req.user._id.toString() === review.user._id.toString()) {
    return next();
  }

  return next(
    new appError("this order doesn't belong to this logged in user", 401)
  );
});
