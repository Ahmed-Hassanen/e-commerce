const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");
const productController = require("../controllers/productController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authController.protect, orderController.getAllOrders)
  .post(
    authController.protect,
    orderController.setProductUserIds,
    orderController.checkOrderQuantity,
    orderController.createOrder
  );
router
  .route("/:id")
  .get(authController.protect, orderController.getOneOrder)
  .patch(authController.protect, orderController.updateOrder)
  .delete(authController.protect, orderController.deleteOrder);

router
  .route("/:id/verify")
  .patch(
    authController.protect,
    productController.isProductSeller,
    orderController.checkOrderQuantity,
    orderController.verifyOrder
  );
module.exports = router;
