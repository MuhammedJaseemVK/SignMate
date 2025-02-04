const userModel = require("../models/userModel");
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
      return res.status(400).send({
        success: false,
        message: error.details[0].message,
      });
    }

    // Find the user in the database
    const user = await userModel.findOne({ _id: req.body.userId });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    user.password = undefined; // Exclude password from the response
    return res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Auth error.",
    });
  }
};

const markLessonAsCompleted = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const user = await userModel.findOne({ _id: req.body.userId });

    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    // Check if lesson is already marked as completed
    const isAlreadyCompleted = user.completedLessons.some(
      (lesson) => lesson.lesson === lessonId
    );

    if (!isAlreadyCompleted) {
      user.completedLessons.push({ lesson: lessonId, completedAt: new Date() });
      user.xp += 10; // Award XP for first-time completion
      await user.save();
    }

    return res.json({
      success: true,
      message: "Lesson marked as completed",
      lessonId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user progress (completed lessons & XP)
const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "completedLessons"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ completedLessons: user.completedLessons, xp: user.xp });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerController,
  loginController,
  authController,
  markLessonAsCompleted,
  getUserProgress,
};
