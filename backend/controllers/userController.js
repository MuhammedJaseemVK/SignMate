const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const Joi = require("joi");

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

module.exports = { registerController };
