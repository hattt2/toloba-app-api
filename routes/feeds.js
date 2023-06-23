const express = require("express");
const router = express.Router();

// plugins
const _ = require("lodash");

// middlewares
const auth = require("../middlewares/auth");

// resources
const successResponse = require("../resources/success-response");

// models
const { Feed } = require("../models/feed");

// Index feeds
router.get("/", auth, async (req, res) => {
  const feeds = await Feed.find({ hidden: false }).sort("title");
  return res.send(successResponse(feeds));
});

module.exports = router;
