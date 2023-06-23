const express = require("express");
const router = express.Router();

// plugins
const _ = require("lodash");

// helpers
const cryptoHelper = require("../helpers/crypto-helper");

// middlewares
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");

// resources
const successResponse = require("../resources/success-response");

// models
const { User, validateUserForEdit } = require("../models/user");

// Get profile
router.get("/me", auth, async (req, res) => {
  return res.send(successResponse(req.user));
});

// Update profile
router.put("/", [auth, validate(validateUserForEdit)], async (req, res) => {
  const attribs = ["password", "mobileNumber", "whatsappNumber"];

  let user = _.pick(req.body, attribs);
  user.updatedAt = Date.now();
  user.updatedBy = req.user._id;

  if (user.password) {
    user.password = await cryptoHelper.hash(user.password);
  }

  user = await User.findOneAndUpdate({ _id: req.user._id }, user, {
    new: true,
  });

  const token = user.generateAuthToken();
  return res
    .header("x-auth-token", token)
    .send(successResponse(_.omit(user.toObject(), ["password"])));
});

module.exports = router;
