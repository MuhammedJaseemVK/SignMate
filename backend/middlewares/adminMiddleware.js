const userModel = require('../models/userModel');

module.exports = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User does not exist" });
    }

    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Access Denied: Admins only" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: `Error in admin middleware: ${error.message}`,
    });
  }
};
