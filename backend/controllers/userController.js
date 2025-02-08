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
    const { userId, lessonId, courseId } = req.body;

    if (!lessonId) {
      return res
        .status(404)
        .json({ success: false, error: "LessonId not found" });
    }

    const user = await userModel.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    // Check if lesson is already completed
    const isAlreadyCompleted = user.completedLessons.some(
      (lesson) => lesson.lesson.toString() === lessonId
    );

    if (!isAlreadyCompleted) {
      user.completedLessons.push({
        lessonId,
        courseId,
        completedAt: new Date(),
      });
      user.xp += 10; // Award XP for first-time completion
      await user.save();
    }

    // Remove sensitive data before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.json({
      success: true,
      message: "Lesson marked as completed",
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

module.exports = {
  registerController,
  loginController,
  authController,
  markLessonAsCompleted,
  getUserProgress,
  getUsersByXP,
};
