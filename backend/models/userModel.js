const mongoose = require("mongoose");

const CompletedLessonSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  courseId: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
  easeFactor: { type: Number, default: 2.5 }, // Ease factor for spaced repetition
  interval: { type: Number, default: 1 }, // Interval in days
  repetitions: { type: Number, default: 0 }, // Count of repetitions
  nextReviewDate: { type: Date, required: true }, // Next review date
  image: { type: String, required: true },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      unique: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "parent"],
      default: "user",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    completedLessons: [CompletedLessonSchema], // Stores lesson completion & spaced repetition data
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 1 },
    maxStreak: { type: Number, default: 1 },
    lastLoginedDay: { type: Date, default: null },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", UserSchema);

module.exports = userModel;
