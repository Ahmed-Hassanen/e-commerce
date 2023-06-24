const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const multer = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");

exports.addProduct = handlerFactory.createOne(Product, "Product");
exports.getAllProducts = handlerFactory.getAll(Product);
exports.getProduct = handlerFactory.getOne(Product, { path: "reviews" });
exports.updateProduct = handlerFactory.updateOne(Product, "Product");
exports.deleteProduct = handlerFactory.deleteOne(Product);

exports.isProductSeller = catchAsync(async (req, res, next) => {
  let productId;
  if (req.params.productId) {
    productId = req.params.productId;
  } else if (req.params.orderId) {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new appError("No order found with that id", 404));
    }
    productId = order.product;
  } else {
    productId = req.params.id;
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

exports.uploadProductImages = multer.upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.saveProductImages = catchAsync(async (req, res, next) => {
  console.log(req.files.imageCover[0].path);
  if (!req.files.imageCover || !req.files.images)
    return next(new appError("you should upload image cover and images", 400));
  const imageCover = await cloudinary.uploadFile(
    req.files.imageCover[0].path,
    "products"
  );
  const images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const image = await cloudinary.uploadFile(file.path, "products");
      images.push(image.url);
    })
  );

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    { imageCover: imageCover.url, images },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: updatedProduct,
  });
});
