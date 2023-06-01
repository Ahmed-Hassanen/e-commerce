const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

exports.setProductUserIds = (req, res, next) => {
  req.body.product = req.params.productId;
  req.body.buyer = req.user.id;
  next();
};

exports.createOrder = handlerFactory.createOne(Order);

exports.checkOrderQuantity = catchAsync(async (req, res, next) => {
  let orderQuantity;
  let productId;
  if ((req.body.quantity || req.body.quantity === 0) && req.params.productId) {
    orderQuantity = req.body.quantity;
    productId = req.params.productId;
  } else {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new appError("No order found with that id", 404));
    }
    orderQuantity = order.quantity;
    productId = order.product;
  }
  const product = await Product.findById(productId);
  if (!product) {
    return next(new appError("No product found with that id", 404));
  }

  if (orderQuantity > product.quantity) {
    return next(new appError("the quantity not available", 400));
  }

  next();
});

exports.getAllOrders = handlerFactory.getAll(Order);
exports.getOneOrder = handlerFactory.getOne(Order);
exports.updateOrder = handlerFactory.updateOne(Order);
exports.deleteOrder = handlerFactory.deleteOne(Order);
exports.verifyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new appError("No order found with that id", 404));
  }
  if (order.done) {
    return next(new appError("the order is already verified", 400));
  }
  const product = await Product.findById(order.product);
  product.quantity -= order.quantity;
  const newProduct = await product.save({ runValidators: true });
  // console.log(newProduct);
  if (!newProduct) {
    return next(new appError("No product found with that id", 404));
  }
  order.done = true;
  const newOrder = await order.save({ runValidators: true });

  res.status(200).json({
    status: "success",
    data: newOrder,
  });
});

exports.isOrderBuyer = catchAsync(async (req, res, next) => {
  const orderId = req.params.orderId || req.params.id;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new appError("No order found with that id", 404));
  }

  // console.log(req.user._id.toString(), order.buyer._id.toString());

  if (req.user._id.toString() === order.buyer._id.toString()) {
    req.params.productId = order.product;
    return next();
  }

  return next(
    new appError("this order doesn't belong to this logged in user", 401)
  );

  next();
});

exports.isOrderDone = catchAsync(async (req, res, next) => {
  const orderId = req.params.orderId || req.params.id;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new appError("No order found with that id", 404));
  }
  if (order.done) {
    return next(new appError("the order is already verified", 400));
  }
  next();
});
