const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "passwords are not the same",
      },
    },
    passwordChangedAt: Date,
    email: {
      type: String,
      required: [true, "student must have an email"],
      unique: [true, "the email is exist already"],
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    photo: {
      type: String,
      default: "https://res.cloudinary.com/dcghglxg0/image/upload/v1687618524/default_rhlric.png",
    },

    verificationCode: String,
    verificationCodeExpires: Date,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // address: {
    //   type: String,
    //   required: [true, "user must have an address"],
    // },
    // phone: {
    //   type: String,
    //   required: [true, "user must have a phone"],
    // },
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

userSchema.virtual("orders", {
  ref: "Order",
  foreignField: "buyer",
  localField: "_id",
});
userSchema.virtual("products", {
  ref: "Product",
  foreignField: "seller",
  localField: "_id",
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createVerificationCode = function () {
  const verifyToken = crypto.randomBytes(3).toString("hex");
  this.verificationCode = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  return verifyToken;
};

const user = mongoose.model("User", userSchema);

module.exports = user;
