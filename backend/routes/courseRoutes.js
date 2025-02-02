const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { addCourse, getCourses } = require("../controllers/courseController");

const router = express.Router();

router.get("/", authMiddleware, getCourses);
router.post("/addCourse", authMiddleware, adminMiddleware, addCourse);

module.exports = router;
