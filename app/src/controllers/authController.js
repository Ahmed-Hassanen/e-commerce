const crypto = require("crypto");
const { promisify } = require("util");
const JWT = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("invalid email or password", 401));
  }

  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({
    status: "success",
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("you should enter your email"));
  }

  const newUser = await User.create({
    email: req.body.email,
  });

  const verifyCode = newUser.createVerificationCode();
  await newUser.save({ validateBeforeSave: false });
  const message = `that email for verifying your account pls copy this code in verification page`;
  try {
    await sendEmail({
      email: newUser.email,
      subject: "your verification code (Valid for 10m)",
      message,
      verifyCode,
    });

    res.status(200).json({
      status: "success",
      message: "Verification code sent to email",
    });
  } catch (err) {
    return next(
      new AppError("there was an error sending the email. try again later", 500)
    );
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  if (!req.body.verifyCode) {
    return next(new AppError("you should enter verifyCode"), 400);
  }
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError("you should enter password and confirm"), 400);
  }
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.verifyCode)
    .digest("hex");

  const user = await User.findOne({
    verificationCode: hashedToken,
    verificationCodeExpires: { $gte: Date.now() },
  });

  if (!user) {
    return next(new AppError("code is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  createSendToken(user, 200, req, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("you should enter your email"));
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("there is no user with email address", 404));
  }

  const verifyCode = user.createVerificationCode();
  await user.save({ validateBeforeSave: false });

  const message = `forgot your Password? your reset password code is `;
  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset reset code (Valid for 10m)",
      message,
      verifyCode,
    });

    res.status(200).json({
      status: "success",
      message: "reset code sent to mail",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("there was an error sending the email. try again later", 500)
    );
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you do not have permission to perform this action", 403)
      );
    }
    next();
  };

exports.register = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("you should enter your email"));
  }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newUser, 201, req, res);
});
