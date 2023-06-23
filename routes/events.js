const express = require("express");
const router = express.Router();

// plugins
const jwt = require("jsonwebtoken");
const _ = require("lodash");

// middlewares
const auth = require("../middlewares/auth");
const silentAuth = require("../middlewares/silent-auth");
const validateObjectId = require("../middlewares/validate-object-id");

// resources
const successResponse = require("../resources/success-response");
const errorResponse = require("../resources/error-response");

// models
const { Event } = require("../models/event");

// Index events
router.get("/", auth, async (req, res) => {
  const query = {
    active: true,
    $or: [
      { public: true },
      {
        subscribers: {
          $elemMatch: { user: { $eq: req.user._id } },
        },
      },
    ],
  };

  let events = await Event.find(query, { link: 0 }).sort("title");

  events.forEach((event) => {
    if (event.subscribers) {
      event.subscribers = event.subscribers.filter((s) =>
        s.user.equals(req.user._id)
      );
    }
  });

  return res.send(successResponse(events));
});

// Get event by id
router.get("/:id", silentAuth, validateObjectId(), async (req, res) => {
  let query = {
    _id: req.params.id,
    active: true,
    $or: [{ public: true }],
  };

  if (req.user) {
    query["$or"].push({
      subscribers: {
        $elemMatch: { user: { $eq: req.user._id } },
      },
    });
  }

  const event = await Event.findOne(query, {
    public: 1,
    link: 1,
    title: 1,
    desc: 1,
    type: 1,
    feedbackForm: 1,
  });

  if (!event) return res.status(404).send(errorResponse(["Event not found."]));
  event.link = encodeLink(event.link);
  return res.send(successResponse(event));
});

function encodeLink(link) {
  return jwt.sign(
    {
      link: link,
    },
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: 1 * 60 }
  );
}

module.exports = router;
