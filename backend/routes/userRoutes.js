const express = require("express");
const {
  registerController,
  loginController,
  authController,
  getUserProgress,
  markLessonAsCompleted,
  getUsersByXP
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/getUserData", authMiddleware, authController);
router.post("/lesson/complete", authMiddleware, markLessonAsCompleted);
router.get("/progress", authMiddleware, getUserProgress);
router.get('/leaderboard', authMiddleware, getUsersByXP);

module.exports = router;
