const express = require("express");
const router = express.Router();

// plugins
const _ = require("lodash");
const Joi = require("joi");

// helpers
const cryptoHelper = require("../helpers/crypto-helper");

// middlewares
const validate = require("../middlewares/validate");

// resources
const successResponse = require("../resources/success-response");
const errorResponse = require("../resources/error-response");

// models
const { User } = require("../models/user");

// Signin
router.post("/", validate(validateLoginRequest), async (req, res) => {
  let user = await User.findOne({ itsNumber: req.body.itsNumber });
  if (!user)
    return res
      .status(400)
      .send(errorResponse(["Invalid ITS Number or password."]));

  const validPassword = await cryptoHelper.hashMatches(
    req.body.password,
    user.password
  );
  if (!validPassword)
    return res
      .status(400)
      .send(errorResponse(["Invalid ITS Number or password."]));

  const token = user.generateAuthToken();
  return res
    .header("x-auth-token", token)
    .send(successResponse(_.omit(user.toObject(), ["password"])));
});

function validateLoginRequest(req) {
  const squema = {
    itsNumber: Joi.string()
      .required()
      .regex(/^\d{8}$/),
    password: Joi.string().required().min(4).max(8),
  };

  return Joi.validate(req, squema, { abortEarly: false });
}

module.exports = router;
