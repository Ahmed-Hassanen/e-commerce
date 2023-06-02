const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authController.protect,
    reviewController.setProductUserIds,
    reviewController.createReview
  );
router
  .route("/:id")
  .get(
    authController.protect,
    reviewController.isReviewOwner,
    reviewController.getReview
  )
  .delete(
    authController.protect,
    reviewController.isReviewOwner,
    reviewController.deleteReview
  )
  .patch(
    authController.protect,
    reviewController.isReviewOwner,
    reviewController.updateReview
  );

module.exports = router;
