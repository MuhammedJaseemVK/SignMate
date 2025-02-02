const express = require("express");
const {
  registerController,
  loginController,
  authController,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/getUserData",authMiddleware, authController);

module.exports = router;
