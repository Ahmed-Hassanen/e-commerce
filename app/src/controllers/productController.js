const Product = require("../models/productModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.addProduct = handlerFactory.createOne(Product, "Product");
exports.getAllProducts = handlerFactory.getAll(Product);
exports.getProduct = handlerFactory.getOne(Product);
exports.updateProduct = handlerFactory.updateOne(Product, "Product");
exports.deleteProduct = handlerFactory.deleteOne(Product);

exports.isProductSeller = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  //   console.log(req.user._id.toString() === product.seller.toString());
  //   console.log(req.user._id.toString());
  //   console.log(product.seller.toString());

  if (req.user._id.toString() === product.seller.toString()) {
    return next();
  }

  return next(
    new AppError("this product doesn't belong to this logged in user", 401)
  );
});
