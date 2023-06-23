const express = require("express");
const router = express.Router();

// middlewares
const auth = require("../../middlewares/auth");
const hasPermission = require("../../middlewares/has-permission");
const validateObjectId = require("../../middlewares/validate-object-id");
const validate = require("../../middlewares/validate");

// plugins
const _ = require("lodash");

// resources
const successResponse = require("../../resources/success-response");
const errorResponse = require("../../resources/error-response");

// models
const { Feed, validateFeed } = require("../../models/feed");

// constants
const userAttribs =
  "itsNumber hofItsNumber namePrefix firstName lastName jamaat mobileNumber whatsappNumber";

// Index feeds
router.get("/", [auth, hasPermission("FEEDS", "READ")], async (req, res) => {
  const feeds = await Feed.find()
    .populate("createdBy", userAttribs)
    .populate("updatedBy", userAttribs)
    .sort("title");

  return res.send(successResponse(feeds));
});

// Add feed
router.post(
  "/",
  [auth, hasPermission("FEEDS", "ADD"), validate(validateFeed)],
  async (req, res) => {
    let feed = new Feed(req.body);
    feed.createdBy = req.user._id;
    feed.updatedBy = req.user._id;
    feed = await feed.save();
    await Feed.populate(feed, "createdBy");
    await Feed.populate(feed, "updatedBy");
    return res.send(successResponse(feed));
  }
);

// Remove feed By id
router.delete(
  "/:id",
  [auth, hasPermission("FEEDS", "REMOVE"), validateObjectId()],
  async (req, res) => {
    if (!(await Feed.findById(req.params.id)))
      return res.status(404).send(errorResponse(["Feed Not Found."]));
    const feed = await Feed.findOneAndDelete({ _id: req.params.id });
    return res.send(successResponse(feed));
  }
);

// Update feed By id
router.put(
  "/:id",
  [
    auth,
    hasPermission("FEEDS", "EDIT"),
    validateObjectId(),
    validate(validateFeed),
  ],
  async (req, res) => {
    const feed = await updateFeed(req.params.id, req.body, req.user);
    return res.send(successResponse(feed));
  }
);

function updateFeed(id, reqBody, user) {
  const feed = reqBody;
  feed.updatedAt = Date.now();
  feed.updatedBy = user._id;

  return Feed.findOneAndUpdate({ _id: id }, feed, {
    new: true,
  })
    .populate("createdBy", userAttribs)
    .populate("updatedBy", userAttribs);
}

module.exports = router;
