const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/signup", authController.signup);
router.post("/verifyEmail", authController.verifyEmail);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword", authController.verifyEmail);

module.exports = router;
