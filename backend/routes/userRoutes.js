const express = require("express");
const {
  registerController,
  loginController,
  authController,
  getUserProgress,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/getUserData", authMiddleware, authController);
router.post("/:userId/complete-lesson", authController, authController);
router.get("/:userId/progress", authController, getUserProgress);

module.exports = router;
