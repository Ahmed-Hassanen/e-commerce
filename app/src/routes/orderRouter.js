const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");
const productController = require("../controllers/productController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    authController.protect,
    productController.isProductSeller,
    orderController.getAllOrders
  )
  .post(
    authController.protect,
    orderController.setProductUserIds,
    orderController.checkOrderQuantity,
    orderController.createOrder
  );

router
  .route("/:id")
  .get(
    authController.protect,
    orderController.isOrderBuyer,
    orderController.getOneOrder
  )
  .patch(
    authController.protect,
    orderController.isOrderBuyer,
    orderController.isOrderDone,
    orderController.checkOrderQuantity,
    orderController.updateOrder
  )
  .delete(
    authController.protect,
    orderController.isOrderBuyer,
    orderController.isOrderDone,
    orderController.deleteOrder
  );

router
  .route("/:orderId/verify")
  .patch(
    authController.protect,
    productController.isProductSeller,
    orderController.checkOrderQuantity,
    orderController.verifyOrder
  );
module.exports = router;
