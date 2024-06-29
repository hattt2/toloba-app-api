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
  const { magicToken, itsNumber } = req.body;
  let user;

  if (magicToken) {
    user = await User.findOne({ magicToken });
    if (!user)
      return res
        .status(400)
        .send(errorResponse(["Invalid Link, Please contact jamaat office."]));
  } else {
    user = await User.findOne({ itsNumber });
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
  }

  const token = user.generateAuthToken();
  return res
    .header("x-auth-token", token)
    .send(
      successResponse(
        _.omit(user.toObject(), ["password", "magicToken", "__v"])
      )
    );
});

function validateLoginRequest(req) {
  const schema = Joi.alternatives().try(
    Joi.object().keys({
      itsNumber: Joi.string()
        .required()
        .regex(/^\d{8}$/),
      password: Joi.string().required().min(4).max(8),
    }),
    Joi.object().keys({
      magicToken: Joi.string().required(),
    })
  );

  return Joi.validate(req, schema, { abortEarly: false });
}

module.exports = router;
