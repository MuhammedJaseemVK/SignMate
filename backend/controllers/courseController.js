const courseModel = require("../models/courseModel");
const lessonModel = require("../models/lessonModel");

// Get all courses with lessons
const getCourses = async (req, res) => {
  try {
    const courses = await courseModel.find().lean();
    const coursesWithLessons = await Promise.all(
      courses.map(async (courseModel) => {
        const lessons = await lessonModel
          .find({ courseId: courseModel._id })
          .lean();
        return { ...courseModel, lessons };
      })
    );
    res.json({ success: true, data: coursesWithLessons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Add a new courseModel
const addCourse = async (req, res) => {
  try {
    const { id, title, description } = req.body;
    const newCourse = await courseModel.create({ id, title, description });
    res.status(201).json({ success: true, data: newCourse });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = { addCourse, getCourses };
