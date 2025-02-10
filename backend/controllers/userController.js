const userModel = require("../models/userModel");
const courseModel = require("../models/courseModel");
const lessonModel = require("../models/lessonModel");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const registerValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name cannot exceed 30 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email cannot be empty",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("user", "admin").default("user").messages({
    "string.base": "Role must be a string",
    "any.only": "Role must be either 'user' or 'admin'",
  }),
});

const registerController = async (req, res) => {
  try {
    // Validate request body using Joi
    const { error, value } = registerValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).send({
        success: false,
        message: "Validation Error",
        errors: error.details.map((err) => err.message),
      });
    }
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(200)
        .send({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const newUser = new userModel(req.body);
    await newUser.save();

    res.status(201).send({ success: true, message: "Registered successfully" });
  } catch (error) {
    console.error("Register Controller Error:", error.message);
    res.status(500).send({
      success: false,
      message: `Register Controller: ${error.message}`,
    });
  }
};

const loginController = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .send({ success: false, message: error.details[0].message });
  }

  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ success: true, message: "Login success", token });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: `Error in login controller: ${error.message}`,
    });
  }
};

const authController = async (req, res) => {
  const authSchema = Joi.object({
    userId: Joi.string()
      .required()
      .regex(/^[a-fA-F0-9]{24}$/)
      .messages({
        "string.pattern.base": "Invalid userId format.",
        "any.required": "userId is required.",
      }),
  });

  try {
    const { error } = authSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Streak logic
    if (!user.lastLoginedDay) {
      user.streak = 1; // First-time login
    } else {
      const lastLoginedDay = new Date(user.lastLoginedDay);
      lastLoginedDay.setHours(0, 0, 0, 0);

      if (lastLoginedDay.getTime() === today.getTime()) {
        console.log("User already logged in today");
      } else if (lastLoginedDay.getTime() === yesterday.getTime()) {
        user.streak += 1; // Continue streak
      } else {
        user.streak = 1; // Reset streak
      }
    }

    user.lastLoginedDay = today;

    await user.save();

    user.password = undefined;

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Auth error.",
    });
  }
};

const markLessonAsCompleted = async (req, res) => {
  try {
    const { userId, lessonId, courseId, image } = req.body;

    if (!lessonId) {
      return res
        .status(404)
        .json({ success: false, error: "LessonId not found" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if lesson is already completed
    const existingLesson = user.completedLessons.find(
      (lesson) => lesson.lessonId.toString() === lessonId
    );

    if (existingLesson) {
      return res.json({
        success: false,
        message: "Lesson was already completed",
      });
    }

    // Calculate the next review date based on the spaced repetition system
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 1); // Start with a 1-day review interval

    // Create revision data for first-time completion
    const revisionData = {
      difficulty: "easy",
      nextReviewDate: nextReviewDate.toISOString(), // Ensure it's correctly set here
      interval: 1, // Initially set interval to 1 day for "easy"
      repetitions: 0, // Initially set repetitions to 0
    };

    // Mark lesson as completed with revision details and nextReviewDate
    user.completedLessons.push({
      lessonId,
      courseId,
      image,
      completedAt: new Date(),
      easeFactor: 2.5, // Optional: add initial easeFactor value
      interval: 1, // Start with a 1-day interval
      repetitions: 0, // Start with 0 repetitions
      nextReviewDate: nextReviewDate, // Ensure nextReviewDate is included here
    });

    user.xp += 10; // Award XP for first-time completion
    await user.save();

    // Remove sensitive data before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.json({
      success: true,
      message: "Lesson marked as completed and revision scheduled",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user progress (completed lessons, courses progress & XP)
const getUserProgress = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.body.userId)
      .populate("completedLessons");

    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    // Calculate progress for each course
    const courseProgress = await Promise.all(
      user.completedLessons.map(async (completedLesson) => {
        const course = await courseModel.findOne({
          id: completedLesson.courseId,
        });

        if (!course) {
          return {
            courseId: completedLesson.courseId,
            courseTitle: "Course not found",
            progress: 0,
          };
        }

        const totalLessons = await lessonModel
          .find({ courseId: completedLesson.courseId })
          .countDocuments();
        const completedLessonsCount = user.completedLessons.filter(
          (lesson) => lesson.courseId === completedLesson.courseId
        ).length;
        const progress = Math.floor(
          (completedLessonsCount / totalLessons) * 100
        );

        return {
          courseId: course.id,
          courseTitle: course.title,
          progress,
        };
      })
    );

    res.json({
      success: true,
      data: {
        coursesProgress: courseProgress,
        xp: user.xp,
        streak: user.streak,
        completedLessons: user.completedLessons,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUsersByXP = async (req, res) => {
  try {
    const users = await userModel.find({}, "name xp streak").sort({ xp: -1 });

    const leaderBoard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      xp: user.xp,
      streak: user.streak,
    }));

    return res.json({ success: true, data: leaderBoard });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const awardXPController = async (req, res) => {
  const { xpPoints, userId } = req.body;

  if (!xpPoints || xpPoints <= 0) {
    return res.status(400).json({ message: "Invalid XP points" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's XP
    user.xp += xpPoints;
    await user.save();

    return res.status(200).json({ success: true, xp: user.xp });
  } catch (error) {
    console.error("Error awarding XP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Spaced repetition constants
const INTERVALS = { easy: 3, medium: 2, hard: 1 };
const EASE_FACTORS = { easy: 1.2, medium: 1.0, hard: 0.8 };

// Update lesson revision status
const updateRevision = async (req, res) => {
  try {
    const { userId, lessonId, difficulty } = req.body;

    if (
      !userId ||
      !lessonId ||
      !["easy", "medium", "hard"].includes(difficulty)
    ) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const lesson = user.completedLessons.find((l) => l.lessonId === lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    // Adjust interval and ease factor
    lesson.easeFactor = Math.max(
      1.3,
      lesson.easeFactor * EASE_FACTORS[difficulty]
    );
    lesson.interval = Math.ceil(lesson.interval * INTERVALS[difficulty]);
    lesson.repetitions += 1;

    // Update next review date
    lesson.nextReviewDate = new Date();
    lesson.nextReviewDate.setDate(
      lesson.nextReviewDate.getDate() + lesson.interval
    );

    // **Increase XP by 20**
    user.xp = (user.xp || 0) + 20;

    await user.save();
    res.json({
      success: true,
      message: "Lesson updated successfully",
      nextReviewDate: lesson.nextReviewDate,
      xp: user.xp, // **Include updated XP in response**
    });
  } catch (error) {
    console.error("Error updating revision:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


module.exports = {
  registerController,
  loginController,
  authController,
  markLessonAsCompleted,
  getUserProgress,
  getUsersByXP,
  awardXPController,
  updateRevision,
};
