const Product = require("../models/productModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

exports.addProduct = handlerFactory.createOne(Product, "Product");
exports.getAllProducts = handlerFactory.getAll(Product);
exports.getProduct = handlerFactory.getOne(Product);
exports.updateProduct = handlerFactory.updateOne(Product, "Product");
exports.deleteProduct = handlerFactory.deleteOne(Product);

exports.isProductSeller = catchAsync(async (req, res, next) => {
  const productId = req.params.productId || req.params.id;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new appError("No product found with that id", 404));
  }

  if (req.user._id.toString() === product.seller.toString()) {
    return next();
  }

  return next(
    new appError("this product doesn't belong to this logged in user", 401)
  );
  next();
});
