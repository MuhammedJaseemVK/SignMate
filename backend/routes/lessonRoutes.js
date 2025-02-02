const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { addLesson, getLessons } = require("../controllers/lessonController");

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, addLesson);
router.get("/:courseId", authMiddleware, getLessons);

module.exports = router;
