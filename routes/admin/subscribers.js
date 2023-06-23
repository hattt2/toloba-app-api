const express = require("express");
const router = express.Router({ mergeParams: true });

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
const { User } = require("../../models/user");
const {
  Event,
  validateItsNumbers,
  validateSubscriberForEdit,
} = require("../../models/event");

// constants
const userAttribs =
  "itsNumber hofItsNumber namePrefix firstName lastName jamaat mobileNumber whatsappNumber";

// Index subscribers
router.get(
  "/",
  [auth, hasPermission("SUBSCRIBERS", "READ"), validateObjectId("eventId")],
  async (req, res) => {
    let subscribers = [];

    const event = await Event.findById(req.params.eventId, {
      subscribers: 1,
    }).populate("subscribers.user", userAttribs);

    if (event) subscribers = event.subscribers;
    return res.send(successResponse(subscribers));
  }
);

// Edit subscriber
router.put(
  "/:id",
  [
    auth,
    hasPermission("SUBSCRIBERS", "EDIT"),
    validateObjectId("eventId"),
    validateObjectId(),
    validate(validateSubscriberForEdit),
  ],
  async (req, res) => {
    await Event.update(
      { _id: req.params.eventId, "subscribers.user": req.params.id },
      {
        $set: {
          "subscribers.$.host": req.body.host,
        },
      }
    );

    let subscribers = [];
    const event = await Event.findById(req.params.eventId, {
      subscribers: 1,
    }).populate("subscribers.user", userAttribs);
    if (event) subscribers = event.subscribers;
    return res.send(successResponse(subscribers));
  }
);

// Remove subscribers
router.delete(
  "/",
  [
    auth,
    hasPermission("SUBSCRIBERS", "REMOVE"),
    validateObjectId("eventId"),
    validate(validateItsNumbers),
  ],
  async (req, res) => {
    let itsNumbers = req.body;
    let subscribers = [];
    const users = await findUsersByItsNumbers(itsNumbers);
    const event = await removeSubscribers(
      req.params.eventId,
      users.existingUsers
    );
    if (event) subscribers = event.subscribers;
    return res.send(successResponse(subscribers));
  }
);

// Add subscribers
router.post(
  "/",
  [
    auth,
    hasPermission("SUBSCRIBERS", "ADD"),
    validateObjectId("eventId"),
    validate(validateItsNumbers),
  ],
  async (req, res) => {
    let itsNumbers = req.body;
    let subscribers = [];
    const users = await findUsersByItsNumbers(itsNumbers);

    if (users.nonExistingItsNumbers && users.nonExistingItsNumbers.length)
      return res
        .status(404)
        .send(
          errorResponse([
            `${users.nonExistingItsNumbers.join(",")} doesn't exists.`,
          ])
        );

    const event = await addSubscribers(req.params.eventId, users.existingUsers);
    if (event) subscribers = event.subscribers;
    return res.send(successResponse(subscribers));
  }
);

async function addSubscribers(eventId, users) {
  await Event.bulkWrite(
    users.map((user) => ({
      updateOne: {
        filter: {
          _id: eventId,
          subscribers: {
            $not: { $elemMatch: { user: { $eq: user._id } } },
          },
        },
        update: {
          $addToSet: { subscribers: { user: user._id } },
        },
      },
    }))
  );

  return Event.findById(eventId, { subscribers: 1 }).populate(
    "subscribers.user",
    userAttribs
  );
}

async function removeSubscribers(eventId, users) {
  const userIds = users.map((user) => user._id);
  await Event.update(
    { _id: eventId },
    { $pull: { subscribers: { user: { $in: userIds } } } },
    { safe: true }
  );

  return Event.findById(eventId, { subscribers: 1 }).populate(
    "subscribers.user",
    userAttribs
  );
}

async function findUsersByItsNumbers(itsNumbers) {
  const existingUsers = await User.find({}, { _id: 1, itsNumber: 1 })
    .where("itsNumber")
    .in(itsNumbers);
  const nonExistingItsNumbers = itsNumbers.filter(
    (itsNumber) => !existingUsers.some((user) => user.itsNumber == itsNumber)
  );

  return { existingUsers, nonExistingItsNumbers };
}

module.exports = router;
