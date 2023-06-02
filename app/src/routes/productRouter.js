const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const orderRouter = require("./orderRouter");
const reviewRouter = require("./reviewRouter");
const router = express.Router();

router.use("/:productId/orders", orderRouter);
router.use("/:productId/reviews", reviewRouter);

router
  .route("/")
  .get(productController.getAllProducts)
  .post(authController.protect, productController.addProduct);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    authController.protect,
    productController.isProductSeller,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    productController.isProductSeller,
    productController.deleteProduct
  );

module.exports = router;
