const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

exports.addProduct = handlerFactory.createOne(Product, "Product");
exports.getAllProducts = handlerFactory.getAll(Product);
exports.getProduct = handlerFactory.getOne(Product, { path: "orders" });
exports.updateProduct = handlerFactory.updateOne(Product, "Product");
exports.deleteProduct = handlerFactory.deleteOne(Product);

exports.isProductSeller = catchAsync(async (req, res, next) => {
  let productId;
  if (req.params.productId) {
    productId = req.params.productId;
  } else if (req.params.id) {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new appError("No order found with that id", 404));
    }
    productId = order.product;
  }
  if (productId) {
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
  }
  next();
});
