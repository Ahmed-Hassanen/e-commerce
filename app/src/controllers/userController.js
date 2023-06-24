const User = require("../models/userModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const cloudinary = require("../utils/cloudinary");
const multer = require("../utils/multer");

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

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((elem) => {
    if (allowedFields.includes(elem)) newObj[elem] = obj[elem];
  });

  return newObj;
};

exports.uploadUserPhoto = multer.upload.single("photo");

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError("this route is not for password updates", 400));
  }
  console.log(req.file);
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) {
    const result = await cloudinary.uploadFile(req.file.path, "users");
    filteredBody.photo = result.url;
    // console.log(result);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});
