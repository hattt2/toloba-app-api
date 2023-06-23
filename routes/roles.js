const express = require("express");
const router = express.Router();

// plugins
const _ = require("lodash");

// middlewares
const auth = require("../middlewares/auth");

// resources
const successResponse = require("../resources/success-response");

// helpers
const { ROLES } = require("../helpers/roles-helper");

// Index roles
router.get("/", auth, async (req, res) => {
  return res.send(successResponse(ROLES));
});

module.exports = router;
