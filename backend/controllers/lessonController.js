const lessonModel = require("../models/lessonModel");

// Get all lessons for a specific course
const getLessons = async (req, res) => {
  try {
    const lessons = await lessonModel.find({ courseId: req.params.courseId });
    res.json({ data: lessons, success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Add a lessonModel to a course
const addLesson = async (req, res) => {
  try {
    const { id, title, image, courseId } = req.body;
    const newLesson = await lessonModel.create({ id, title, image, courseId });
    res.status(201).json({ success: true, data: newLesson });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = { getLessons, addLesson };
