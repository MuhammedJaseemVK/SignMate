const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    courseId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const lessonModel = mongoose.model("lessons", lessonSchema);
module.exports = lessonModel;
