const User = require("../models/userModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

exports.getAllUsers = handlerFactory.getAll(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.getOneUser = handlerFactory.getOne(User);
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "orders products",
  });
  res.status(200).json({
    status: "success",
    data: user,
  });
});
