const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const courseModel = mongoose.model("courses", courseSchema);
module.exports = courseModel;
